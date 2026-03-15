#!/usr/bin/env python3
"""
LEET Pain Point 증거 수집 크롤러
=================================
LEET 수험생 커뮤니티에서 Pain Point 관련 게시글을 키워드 검색으로 수집하는 CLI 도구.

지원 플랫폼:
  - 디시인사이드 법전원갤러리 (공개, requests + BS4)
  - 오르비 (공개, requests + BS4)
  - 네이버 블로그 검색 (공개, requests + BS4)
  - 네이버/다음 카페 (로그인 필요, Playwright)

사용법:
  python leet_crawler.py --platform dcinside --pain-point 1
  python leet_crawler.py --platform all --pain-point all
  python leet_crawler.py --platform dcinside --keyword "LEET 해설 다르다"
  python leet_crawler.py --platform naver_cafe --login

GitHub 참고:
  - dc-api (eunchuldev): 디시인사이드 모바일 API 패턴
  - Scrapling (D4Vinci): anti-bot 우회 패턴
  - Crawl4AI (unclecode): 스텔스 크롤링 패턴
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from urllib.parse import quote, urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# 같은 디렉토리의 config 임포트
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    DC_HEADERS,
    GENERAL_HEADERS,
    KEYWORDS,
    MAX_PAGES,
    MAX_POSTS_PER_KEYWORD,
    OUTPUT_DIR,
    OUTPUT_JSON,
    OUTPUT_MD,
    REQUEST_DELAY,
)


# ============================================================
# 유틸리티 함수
# ============================================================

def log(msg, level="INFO"):
    """컬러 로그 출력"""
    colors = {"INFO": "\033[94m", "OK": "\033[92m", "WARN": "\033[93m", "ERR": "\033[91m"}
    reset = "\033[0m"
    color = colors.get(level, "")
    print(f"{color}[{level}]{reset} {msg}")


def get_delay():
    """현재 설정된 딜레이 값 반환"""
    try:
        import config as _cfg
        return _cfg.REQUEST_DELAY
    except Exception:
        return REQUEST_DELAY


def safe_request(url, headers=None, timeout=15, retries=3):
    """안전한 HTTP GET 요청 (재시도 + 딜레이)"""
    delay = get_delay()
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=headers or GENERAL_HEADERS, timeout=timeout)
            resp.raise_for_status()
            return resp
        except requests.RequestException as e:
            if attempt < retries - 1:
                log(f"요청 실패 ({attempt+1}/{retries}): {e}", "WARN")
                time.sleep(delay * (attempt + 1))
            else:
                log(f"요청 최종 실패: {url} — {e}", "ERR")
                return None


def clean_text(text):
    """텍스트 정리 (여러 공백/줄바꿈 정리, 앞뒤 공백 제거)"""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def is_leet_related(title, content):
    """LEET/로스쿨 관련 게시글인지 판별 (노이즈 필터링)"""
    text = (title + " " + content).lower()

    # 0차: 노이즈 차단 — 게임/팬픽/번역/스포츠 등 명백히 무관한 글 차단
    noise_keywords = [
        "팬픽", "핫산", "레이드", "던파", "롤체", "메이플", "원신",
        "스타크래프트", "오버워치", "로아", "로스트아크", "블루아카이브",
        "리그오브레전드", "발로란트", "솔큐", "파르고", "림월드",
        "레딧 반응", "번역)", "제미나이 번역", "소설핫산", "괴문서",
        "아이돌", "프로듀스", "프듀", "케이팝", "kpop",
        "야구", "축구", "농구", "e스포츠", "lck", "lpl",
        "애니", "만화", "라노벨", "라이트노벨", "동인",
        "맛집", "여행", "요리", "레시피",
        "뉴비 가이드", "공략 모음", "풀제약", "1인클", "렌싱",
        "통나무", "금광", "빅토", "SO클래식", "대검전사",
    ]
    if any(nk in text for nk in noise_keywords):
        return False

    # 1차: 핵심 키워드 (하나라도 있으면 통과)
    core_keywords = [
        "leet", "리트", "로스쿨", "법전원", "법학적성", "법학전문",
        "추리논증", "언어이해", "법조인", "변호사시험", "변시",
        "메가로스쿨", "메가로이어스", "시대인재", "이원준", "법률저널",
        "로스쿨 준비", "로스쿨 입시", "법학대학원",
    ]
    if any(kw in text for kw in core_keywords):
        return True

    # 2차: 조합 키워드 (2개 이상 동시 출현 시 통과)
    secondary_keywords = [
        "해설", "학원비", "과외", "점수", "오답", "정체",
        "독학", "인강", "사교육", "금수저", "학비",
        "변호사", "사법시험", "법대", "법학",
    ]
    count = sum(1 for kw in secondary_keywords if kw in text)
    return count >= 2


def make_result(platform, url, title, content, date_str="", comments=None):
    """수집 결과를 표준 딕셔너리로 반환"""
    return {
        "platform": platform,
        "url": url,
        "title": clean_text(title),
        "content": clean_text(content),
        "date": date_str,
        "comments": comments or [],
        "collected_at": datetime.now().isoformat(),
    }


# ============================================================
# 디시인사이드 크롤러
# ============================================================

class DCInsideCrawler:
    """
    디시인사이드 마이너 갤러리 크롤러.
    참고: dc-api (eunchuldev), dcinside-scraper (ji1kang)
    모바일 페이지 사용으로 anti-bot 우회 + 간결한 HTML 구조 활용.
    """

    GALLERY_ID = "lawschool"
    MOBILE_BASE = "https://m.dcinside.com"
    PC_SEARCH = "https://search.dcinside.com/combine/q"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(DC_HEADERS)

    def search_keyword(self, keyword, max_results=MAX_POSTS_PER_KEYWORD):
        """디시인사이드 통합검색으로 키워드 검색"""
        log(f"[DCInside] 검색: '{keyword}'")
        results = []
        seen_urls = set()
        encoded = quote(keyword)

        for page in range(1, MAX_PAGES + 1):
            url = f"{self.PC_SEARCH}/{encoded}/p/{page}"
            resp = safe_request(url, headers={
                **DC_HEADERS,
                "Referer": "https://search.dcinside.com/",
            })
            if not resp:
                break

            soup = BeautifulSoup(resp.text, "lxml")

            # 검색 결과 게시글 링크 추출
            articles = soup.select("a.tit_txt")
            if not articles:
                articles = soup.select("ul.cont_listbox li a")

            if not articles:
                log(f"  페이지 {page}: 결과 없음", "WARN")
                break

            for article in articles:
                href = article.get("href", "")
                title = clean_text(article.get_text())

                # 법전원갤러리(lawschool) 게시글만 수집
                if "lawschool" in href:
                    full_url = href if href.startswith("http") else urljoin("https://gall.dcinside.com", href)
                    if full_url not in seen_urls:
                        seen_urls.add(full_url)
                        results.append({"url": full_url, "title": title})

                if len(results) >= max_results:
                    break

            if len(results) >= max_results:
                break

            time.sleep(REQUEST_DELAY)

        log(f"  → {len(results)}개 게시글 발견", "OK")
        return results

    def search_gallery(self, keyword, max_results=MAX_POSTS_PER_KEYWORD):
        """갤러리 내 검색 (검색 API가 안 될 경우 대체)"""
        log(f"[DCInside] 갤러리 내 검색: '{keyword}'")
        results = []
        encoded = quote(keyword)

        for page in range(1, MAX_PAGES + 1):
            url = (
                f"https://gall.dcinside.com/mgallery/board/lists"
                f"?id={self.GALLERY_ID}"
                f"&s_type=search_subject_memo"
                f"&s_keyword={encoded}"
                f"&page={page}"
            )
            resp = safe_request(url, headers={
                **DC_HEADERS,
                "Referer": f"https://gall.dcinside.com/mgallery/board/lists?id={self.GALLERY_ID}",
            })
            if not resp:
                break

            soup = BeautifulSoup(resp.text, "lxml")
            rows = soup.select("tr.ub-content")

            if not rows:
                break

            for row in rows:
                link = row.select_one("td.gall_tit a")
                if not link:
                    continue

                href = link.get("href", "")
                title = clean_text(link.get_text())
                post_no = row.select_one("td.gall_num")
                post_no_text = post_no.get_text().strip() if post_no else ""

                # 공지사항 등 제외
                if not post_no_text.isdigit():
                    continue

                full_url = f"https://gall.dcinside.com/mgallery/board/view/?id={self.GALLERY_ID}&no={post_no_text}"
                date_el = row.select_one("td.gall_date")
                date_str = date_el.get("title", date_el.get_text().strip()) if date_el else ""

                results.append({"url": full_url, "title": title, "date": date_str})

                if len(results) >= max_results:
                    break

            if len(results) >= max_results:
                break
            time.sleep(REQUEST_DELAY)

        log(f"  → {len(results)}개 게시글 발견", "OK")
        return results

    def get_post(self, url):
        """개별 게시글 본문 + 댓글 수집"""
        log(f"  본문 수집: {url}")

        # 모바일 URL로 변환 (파싱 용이)
        mobile_url = self._to_mobile_url(url)
        resp = safe_request(mobile_url, headers=DC_HEADERS)
        if not resp:
            return None

        soup = BeautifulSoup(resp.text, "lxml")

        # 제목 (여러 셀렉터 시도)
        title_el = (
            soup.select_one("span.title-subject") or
            soup.select_one("h3.title span") or
            soup.select_one("h3.title") or
            soup.select_one("div.gallview_head span.title_subject") or
            soup.select_one("title")
        )
        title = clean_text(title_el.get_text()) if title_el else ""
        # <title> 태그에서 가져온 경우 사이트명 제거
        if " - " in title:
            title = title.split(" - ")[0].strip()

        # 본문 (여러 셀렉터 시도)
        content_el = (
            soup.select_one("div.thum-txtin") or
            soup.select_one("div.writing_view_box") or
            soup.select_one("div.gallery_re_content") or
            soup.select_one("div.view_content_wrap") or
            soup.select_one("div#container div._article")
        )
        content = clean_text(content_el.get_text()) if content_el else ""

        # 날짜
        date_el = (
            soup.select_one("span.gall_date") or
            soup.select_one("span.date") or
            soup.select_one("div.fl span.gall_date")
        )
        date_str = clean_text(date_el.get_text()) if date_el else ""

        # 댓글 (모바일 페이지에 표시된 것만)
        comments = []
        comment_els = soup.select("div.comment_dccon") or soup.select("div.usertxt") or soup.select("p.usertxt")
        for c in comment_els:
            ctext = clean_text(c.get_text())
            if ctext:
                comments.append(ctext)

        time.sleep(REQUEST_DELAY)
        return make_result("디시인사이드 법전원갤러리", url, title, content, date_str, comments)

    def _to_mobile_url(self, url):
        """PC URL → 모바일 URL 변환"""
        # https://gall.dcinside.com/mgallery/board/view/?id=lawschool&no=12345
        # → https://m.dcinside.com/board/lawschool/12345
        import re as _re
        match = _re.search(r'id=([^&]+).*?no=(\d+)', url)
        if match:
            gall_id, post_no = match.group(1), match.group(2)
            return f"{self.MOBILE_BASE}/board/{gall_id}/{post_no}"
        return url

    def crawl(self, keyword):
        """키워드로 검색 → 게시글 본문 수집 (LEET 관련 글만 필터링)"""
        # 먼저 갤러리 내 검색 시도
        posts = self.search_gallery(keyword)
        if not posts:
            # 갤러리 내 검색 실패 시 통합검색
            posts = self.search_keyword(keyword)

        # URL 중복 제거
        seen = set()
        unique_posts = []
        for p in posts:
            if p["url"] not in seen:
                seen.add(p["url"])
                unique_posts.append(p)

        results = []
        for post in unique_posts:
            result = self.get_post(post["url"])
            if result and result["content"]:
                # LEET/로스쿨 관련 글만 필터링
                if is_leet_related(result["title"], result["content"]):
                    results.append(result)
                else:
                    log(f"  [필터링] 무관한 글 제외: {result['title'][:40]}", "WARN")
        return results


# ============================================================
# 오르비 크롤러
# ============================================================

class OrbiCrawler:
    """
    오르비(Orbi) 크롤러.
    오르비는 공개 사이트로, 검색 결과 페이지를 파싱하여 게시글 수집.
    """

    BASE_URL = "https://orbi.kr"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(GENERAL_HEADERS)

    def search_keyword(self, keyword, max_results=MAX_POSTS_PER_KEYWORD):
        """오르비 검색"""
        log(f"[오르비] 검색: '{keyword}'")
        results = []
        seen_urls = set()
        encoded = quote(keyword)

        for page in range(1, MAX_PAGES + 1):
            url = f"{self.BASE_URL}/search?q={encoded}&page={page}"
            resp = safe_request(url, headers=GENERAL_HEADERS)
            if not resp:
                break

            soup = BeautifulSoup(resp.text, "lxml")

            # 오르비 게시글 링크 패턴: /000XXXXXXXXXX/제목slug
            all_links = soup.select("a[href]")
            articles = []
            for a in all_links:
                href = a.get("href", "")
                text = clean_text(a.get_text())
                # /000으로 시작하는 11자리+ 숫자 패턴이 게시글 URL
                if re.match(r'/\d{11,}/', href) and len(text) > 5:
                    # 날짜 텍스트(MM/DD HH:MM) 제외, 제목만
                    if not re.match(r'^\d{2}/\d{2}\s+\d{2}:\d{2}$', text):
                        articles.append(a)

            if not articles:
                break

            for article in articles:
                href = article.get("href", "")
                title = clean_text(article.get_text())

                # 쿼리 파라미터 제거하여 중복 체크
                clean_href = href.split("?")[0]
                full_url = urljoin(self.BASE_URL, clean_href)

                if full_url not in seen_urls and title:
                    seen_urls.add(full_url)
                    results.append({"url": full_url, "title": title})

                if len(results) >= max_results:
                    break

            if len(results) >= max_results:
                break
            time.sleep(REQUEST_DELAY)

        log(f"  → {len(results)}개 게시글 발견", "OK")
        return results

    def get_post(self, url):
        """개별 게시글 본문 수집 (오르비는 SPA이므로 meta + body 텍스트에서 추출)"""
        log(f"  본문 수집: {url}")
        resp = safe_request(url, headers=GENERAL_HEADERS)
        if not resp:
            return None

        soup = BeautifulSoup(resp.text, "lxml")

        # 제목: og:title 메타태그에서 추출
        meta_title = soup.select_one('meta[property="og:title"]')
        title = meta_title.get("content", "").replace(" - 오르비", "").strip() if meta_title else ""
        if not title:
            title = soup.title.string.replace(" | 오르비", "").strip() if soup.title else ""

        # 본문: body에서 script/style 제거 후 텍스트 추출
        # 오르비는 React SPA지만 SSR로 body에 텍스트가 포함됨
        content = ""
        body = soup.select_one("body")
        if body:
            for tag in body.select("script, style, noscript, header, nav, footer"):
                tag.decompose()
            body_text = body.get_text(separator=" ", strip=True)
            # 게시글 본문 영역 추출 (제목 이후 ~ 댓글/추천 이전)
            if title and title in body_text:
                idx = body_text.find(title)
                content = body_text[idx + len(title):]
                # 불필요한 앞부분 정리 (날짜, 조회수 등은 유지)
                content = clean_text(content[:3000])  # 최대 3000자
            else:
                # 제목을 못 찾으면 og:description 사용
                meta_desc = soup.select_one('meta[property="og:description"]')
                content = meta_desc.get("content", "").strip() if meta_desc else ""

        # 날짜: body 텍스트에서 패턴 추출
        date_str = ""
        date_match = re.search(r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})', resp.text)
        if date_match:
            date_str = date_match.group(1)

        time.sleep(REQUEST_DELAY)
        return make_result("오르비", url, title, content, date_str)

    def crawl(self, keyword):
        """키워드로 검색 → 게시글 본문 수집"""
        posts = self.search_keyword(keyword)
        results = []
        for post in posts:
            result = self.get_post(post["url"])
            if result and result["content"]:
                results.append(result)
        return results


# ============================================================
# 네이버 블로그 검색 크롤러
# ============================================================

class NaverBlogCrawler:
    """
    네이버 블로그 검색 크롤러.
    네이버 검색 결과에서 블로그 게시글 URL과 미리보기를 수집.
    """

    SEARCH_URL = "https://search.naver.com/search.naver"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(GENERAL_HEADERS)

    def search_keyword(self, keyword, max_results=MAX_POSTS_PER_KEYWORD):
        """네이버 블로그 검색"""
        log(f"[네이버 블로그] 검색: '{keyword}'")
        results = []
        encoded = quote(keyword)

        for start in range(1, max_results + 1, 10):
            url = f"{self.SEARCH_URL}?where=blog&query={encoded}&start={start}"
            resp = safe_request(url, headers=GENERAL_HEADERS)
            if not resp:
                break

            soup = BeautifulSoup(resp.text, "lxml")

            # 블로그 검색 결과
            items = soup.select("div.detail_box") or soup.select("li.bx")
            if not items:
                break

            for item in items:
                link_el = item.select_one("a.api_txt_lines") or item.select_one("a.title_link")
                if not link_el:
                    continue

                href = link_el.get("href", "")
                title = clean_text(link_el.get_text())

                # 미리보기 텍스트
                desc_el = item.select_one("div.dsc_txt") or item.select_one("a.api_txt_lines.dsc_txt")
                desc = clean_text(desc_el.get_text()) if desc_el else ""

                # 날짜
                date_el = item.select_one("span.sub_time") or item.select_one("span.date")
                date_str = clean_text(date_el.get_text()) if date_el else ""

                if title and href:
                    results.append({
                        "url": href,
                        "title": title,
                        "preview": desc,
                        "date": date_str,
                    })

                if len(results) >= max_results:
                    break

            if len(results) >= max_results:
                break
            time.sleep(REQUEST_DELAY)

        log(f"  → {len(results)}개 블로그 발견", "OK")
        return results

    def get_post(self, url):
        """네이버 블로그 본문 수집 (iframe 처리)"""
        log(f"  본문 수집: {url}")

        # 네이버 블로그는 iframe 구조 → PostView URL로 변환
        if "blog.naver.com" in url:
            resp = safe_request(url, headers=GENERAL_HEADERS)
            if not resp:
                return None

            soup = BeautifulSoup(resp.text, "lxml")
            iframe = soup.select_one("iframe#mainFrame")
            if iframe:
                iframe_src = iframe.get("src", "")
                if iframe_src:
                    url = urljoin(url, iframe_src)
                    resp = safe_request(url, headers=GENERAL_HEADERS)
                    if not resp:
                        return None
                    soup = BeautifulSoup(resp.text, "lxml")
        else:
            resp = safe_request(url, headers=GENERAL_HEADERS)
            if not resp:
                return None
            soup = BeautifulSoup(resp.text, "lxml")

        # 본문 추출
        content_el = (
            soup.select_one("div.se-main-container") or  # 스마트에디터
            soup.select_one("div#postViewArea") or  # 구버전
            soup.select_one("div.post-view") or
            soup.select_one("article")
        )
        content = clean_text(content_el.get_text()) if content_el else ""

        title_el = soup.select_one("div.se-title-text") or soup.select_one("h3.se_textarea")
        title = clean_text(title_el.get_text()) if title_el else ""

        time.sleep(REQUEST_DELAY)
        return make_result("네이버 블로그", url, title, content)

    def crawl(self, keyword):
        """키워드로 검색 → 블로그 본문 수집"""
        posts = self.search_keyword(keyword)
        results = []
        for post in posts:
            result = self.get_post(post["url"])
            if result and result["content"]:
                # 검색 결과의 미리보기와 날짜 보충
                if not result["date"] and post.get("date"):
                    result["date"] = post["date"]
                results.append(result)
            elif post.get("preview"):
                # 본문 접근 실패 시 미리보기라도 저장
                results.append(make_result(
                    "네이버 블로그", post["url"], post["title"],
                    post["preview"], post.get("date", "")
                ))
        return results


# ============================================================
# 네이버/다음 카페 크롤러 (Playwright 필요)
# ============================================================

class CafeCrawler:
    """
    네이버/다음 카페 크롤러 (로그인 필요).
    Playwright를 사용하여 브라우저 자동화.

    참고:
    - Chrome 디버깅 모드 (가장 안정적)
    - kisoo95/Naver-cafe-crawling-ver240115
    - DevSusu/DaumCafeCrawler
    """

    def __init__(self, platform="naver"):
        self.platform = platform  # "naver" or "daum"
        self.browser = None
        self.page = None

    def launch_browser(self, headless=False):
        """Playwright 브라우저 실행"""
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            log("Playwright가 설치되지 않았습니다. 설치: pip install playwright && playwright install", "ERR")
            log("또는 Chrome 디버깅 모드를 사용하세요.", "WARN")
            return False

        self._pw = sync_playwright().start()
        self.browser = self._pw.chromium.launch(
            headless=headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ]
        )
        context = self.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="ko-KR",
        )
        self.page = context.new_page()
        return True

    def login_naver(self, naver_id, naver_pw):
        """네이버 로그인 (Playwright)"""
        log("[카페] 네이버 로그인 시도...")
        self.page.goto("https://nid.naver.com/nidlogin.login")
        time.sleep(2)

        # JavaScript로 값 주입 (봇 탐지 우회)
        self.page.evaluate(f"document.getElementById('id').value = '{naver_id}'")
        self.page.evaluate(f"document.getElementById('pw').value = '{naver_pw}'")
        time.sleep(1)

        self.page.click("#log\\.login")
        time.sleep(3)

        # 로그인 성공 확인
        if "nid.naver.com" not in self.page.url:
            log("네이버 로그인 성공!", "OK")
            return True
        else:
            log("네이버 로그인 실패. CAPTCHA가 뜰 수 있습니다.", "ERR")
            log("Chrome 디버깅 모드로 수동 로그인 후 쿠키를 사용하세요.", "WARN")
            return False

    def login_kakao(self, kakao_id, kakao_pw):
        """카카오 로그인 (다음 카페용, Playwright)"""
        log("[카페] 카카오 로그인 시도...")
        self.page.goto("https://accounts.kakao.com/login?continue=https://m.cafe.daum.net/snuleet")
        time.sleep(3)

        try:
            # 방법 1: input[name] 셀렉터로 시도
            # 카카오 로그인 페이지 요소 찾기
            email_input = self.page.query_selector("input[name='loginId']") or \
                          self.page.query_selector("input#loginId--1")
            pw_input = self.page.query_selector("input[name='password']") or \
                       self.page.query_selector("input#password--2") or \
                       self.page.query_selector("input[type='password']")

            if email_input and pw_input:
                # 봇 탐지 우회: 클릭 후 한 글자씩 type() 사용
                email_input.click()
                time.sleep(0.3)
                self.page.keyboard.type(kakao_id, delay=50)  # 50ms 간격
                time.sleep(0.5)

                pw_input.click()
                time.sleep(0.3)
                self.page.keyboard.type(kakao_pw, delay=50)
                time.sleep(1)

                # 로그인 버튼 클릭
                submit_btn = self.page.query_selector("button[type='submit']")
                if submit_btn:
                    submit_btn.click()
                else:
                    self.page.keyboard.press("Enter")
                time.sleep(5)
            else:
                log("로그인 폼 요소를 찾을 수 없습니다. 페이지 구조 확인 필요.", "ERR")
                log("브라우저에서 직접 로그인해주세요.", "WARN")
                return False

        except Exception as e:
            log(f"카카오 로그인 오류: {e}", "ERR")
            return False

        # 로그인 성공 확인 — 카페 페이지 내용이 보이면 성공
        current_url = self.page.url
        page_text = self.page.query_selector("body").inner_text() if self.page.query_selector("body") else ""

        if "cafe" in current_url or "게시판" in page_text or "최신글" in page_text or "서로연" in page_text:
            log("카카오 로그인 성공! (서로연 카페 접근 확인)", "OK")
            return True
        elif "accounts.kakao.com" not in current_url:
            log("카카오 로그인 성공!", "OK")
            return True
        else:
            log("카카오 로그인 실패 (CAPTCHA 또는 2단계 인증 가능).", "ERR")
            return False

    # ---- 다음 카페 (서로연) ----

    def search_daum_cafe(self, keyword, cafe_id="snuleet", max_results=MAX_POSTS_PER_KEYWORD):
        """다음 카페 내 키워드 검색 (서로연 등)"""
        log(f"[다음카페] 검색: '{keyword}' in {cafe_id}")
        if not self.page:
            log("브라우저가 실행되지 않았습니다.", "ERR")
            return []

        encoded = quote(keyword)
        # 다음 카페 모바일 검색 URL
        search_url = f"https://m.cafe.daum.net/{cafe_id}/_search?query={encoded}"
        self.page.goto(search_url)
        time.sleep(3)

        results = []
        try:
            # 모바일 페이지는 iframe 없이 직접 접근 가능
            articles = self.page.query_selector_all("a.tit_txt") or self.page.query_selector_all("a.link_txt")
            if not articles:
                # 대체: 게시글 링크 패턴으로 찾기
                articles = self.page.query_selector_all(f"a[href*='/{cafe_id}/']")

            for article in articles[:max_results]:
                title = article.inner_text().strip()
                href = article.get_attribute("href")
                if title and href:
                    if not href.startswith("http"):
                        href = f"https://m.cafe.daum.net{href}"
                    results.append({"url": href, "title": title})
        except Exception as e:
            log(f"다음 카페 검색 오류: {e}", "ERR")

        log(f"  → {len(results)}개 게시글 발견", "OK")
        return results

    def get_daum_cafe_post(self, url):
        """다음 카페 게시글 본문 수집"""
        log(f"  본문 수집: {url}")
        if not self.page:
            return None

        # 모바일 URL로 변환
        if "m.cafe.daum.net" not in url:
            url = url.replace("cafe.daum.net", "m.cafe.daum.net")

        self.page.goto(url)
        time.sleep(3)

        try:
            # 제목
            title_el = self.page.query_selector("h3.tit_subject") or self.page.query_selector("strong.tit_subject") or self.page.query_selector("h3.tit_viewer")
            title_text = title_el.inner_text().strip() if title_el else ""

            # 본문
            content_el = self.page.query_selector("div.article_view") or self.page.query_selector("div.cont_article") or self.page.query_selector("div#article")
            content_text = content_el.inner_text().strip() if content_el else ""

            # 날짜
            date_el = self.page.query_selector("span.txt_detail") or self.page.query_selector("span.date")
            date_text = date_el.inner_text().strip() if date_el else ""

            # 댓글
            comments = []
            comment_els = self.page.query_selector_all("p.desc_txt") or self.page.query_selector_all("div.comment_view p")
            for c in comment_els[:10]:
                ctext = c.inner_text().strip()
                if ctext:
                    comments.append(ctext)

            return make_result("다음 카페 (서로연)", url, title_text, content_text, date_text, comments)
        except Exception as e:
            log(f"게시글 수집 오류: {e}", "ERR")
            return None

    # ---- 네이버 카페 ----

    def search_cafe(self, keyword, cafe_url="https://cafe.naver.com/lawschoolprep"):
        """네이버 카페 내 키워드 검색"""
        log(f"[네이버카페] 검색: '{keyword}' in {cafe_url}")
        if not self.page:
            log("브라우저가 실행되지 않았습니다.", "ERR")
            return []

        encoded = quote(keyword)
        search_url = f"{cafe_url}?iframe_url=/ArticleSearchList.nhn%3Fsearch.query={encoded}"
        self.page.goto(search_url)
        time.sleep(3)

        results = []
        try:
            frame = self.page.frame("cafe_main")
            if not frame:
                frames = self.page.frames
                frame = frames[1] if len(frames) > 1 else self.page

            articles = frame.query_selector_all("a.article")
            for article in articles[:MAX_POSTS_PER_KEYWORD]:
                title = article.inner_text().strip()
                href = article.get_attribute("href")
                if title and href:
                    full_url = urljoin(cafe_url, href)
                    results.append({"url": full_url, "title": title})
        except Exception as e:
            log(f"카페 검색 오류: {e}", "ERR")

        log(f"  → {len(results)}개 게시글 발견", "OK")
        return results

    def get_post(self, url):
        """네이버 카페 게시글 본문 수집"""
        log(f"  본문 수집: {url}")
        if not self.page:
            return None

        self.page.goto(url)
        time.sleep(3)

        try:
            frame = self.page.frame("cafe_main")
            if not frame:
                frames = self.page.frames
                frame = frames[1] if len(frames) > 1 else self.page

            title = frame.query_selector("h3.title_text")
            title_text = title.inner_text().strip() if title else ""

            content = frame.query_selector("div.se-main-container") or frame.query_selector("div.ContentRenderer")
            content_text = content.inner_text().strip() if content else ""

            date_el = frame.query_selector("span.date")
            date_text = date_el.inner_text().strip() if date_el else ""

            comments = []
            comment_els = frame.query_selector_all("span.text_comment")
            for c in comment_els:
                ctext = c.inner_text().strip()
                if ctext:
                    comments.append(ctext)

            return make_result("네이버 카페", url, title_text, content_text, date_text, comments)
        except Exception as e:
            log(f"게시글 수집 오류: {e}", "ERR")
            return None

    def close(self):
        """브라우저 종료"""
        if self.browser:
            self.browser.close()
        if hasattr(self, '_pw'):
            self._pw.stop()


# ============================================================
# 결과 내보내기
# ============================================================

def export_json(results, filepath=None):
    """결과를 JSON 파일로 저장"""
    filepath = filepath or OUTPUT_JSON
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    log(f"JSON 저장: {filepath} ({len(results)}건)", "OK")


def export_markdown(results, filepath=None):
    """결과를 Markdown 파일로 저장"""
    filepath = filepath or OUTPUT_MD
    lines = [
        "# LEET Pain Point 크롤링 결과\n",
        f"> 수집 일시: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n",
        f"> 총 수집 건수: {len(results)}건\n",
        "---\n",
    ]

    for i, r in enumerate(results, 1):
        lines.append(f"## 수집 #{i}\n")
        lines.append(f"- **출처**: {r.get('platform', 'N/A')}\n")
        lines.append(f"- **URL**: {r.get('url', 'N/A')}\n")
        lines.append(f"- **날짜**: {r.get('date', '확인 불가')}\n")
        lines.append(f"- **제목**: {r.get('title', 'N/A')}\n")

        content = r.get("content", "")
        if len(content) > 500:
            content = content[:500] + "... (생략)"
        lines.append(f"- **내용 발췌**: \"{content}\"\n")

        if r.get("comments"):
            lines.append(f"- **댓글** ({len(r['comments'])}건):\n")
            for c in r["comments"][:5]:  # 최대 5개
                if len(c) > 200:
                    c = c[:200] + "..."
                lines.append(f"  - \"{c}\"\n")

        lines.append("\n---\n")

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(lines)
    log(f"Markdown 저장: {filepath} ({len(results)}건)", "OK")


# ============================================================
# CLI 메인
# ============================================================

def get_crawler(platform):
    """플랫폼별 크롤러 인스턴스 반환"""
    crawlers = {
        "dcinside": DCInsideCrawler,
        "orbi": OrbiCrawler,
        "naver_blog": NaverBlogCrawler,
    }
    cls = crawlers.get(platform)
    if cls:
        return cls()
    return None


def get_keywords(pain_point):
    """Pain Point 번호에 해당하는 키워드 리스트 반환"""
    mapping = {
        "1": "pain_point_1_해설불일치",
        "2": "pain_point_2_피드백부재",
        "3": "pain_point_3_접근성불평등",
    }
    key = mapping.get(str(pain_point))
    if key:
        return {key: KEYWORDS[key]}
    elif str(pain_point).lower() == "all":
        return KEYWORDS
    return {}


def main():
    parser = argparse.ArgumentParser(
        description="LEET 수험생 Pain Point 증거 수집 크롤러",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  # 디시인사이드에서 Pain Point 1 (해설 불일치) 검색
  python leet_crawler.py --platform dcinside --pain-point 1

  # 모든 플랫폼에서 모든 Pain Point 검색
  python leet_crawler.py --platform all --pain-point all

  # 특정 키워드로 검색
  python leet_crawler.py --platform dcinside --keyword "LEET 해설 다르다"

  # 네이버 카페 (로그인 필요)
  python leet_crawler.py --platform naver_cafe --login --naver-id YOUR_ID --naver-pw YOUR_PW

  # 결과 저장 경로 지정
  python leet_crawler.py --platform dcinside --pain-point 1 --output-dir ./results
        """,
    )

    parser.add_argument(
        "--platform", "-p",
        choices=["dcinside", "orbi", "naver_blog", "naver_cafe", "daum_cafe", "all"],
        default="dcinside",
        help="크롤링 대상 플랫폼 (기본: dcinside). daum_cafe = 서로연",
    )
    parser.add_argument(
        "--pain-point", "-pp",
        choices=["1", "2", "3", "all"],
        default=None,
        help="수집할 Pain Point 번호 (1: 해설불일치, 2: 피드백부재, 3: 접근성불평등, all: 전체)",
    )
    parser.add_argument(
        "--keyword", "-k",
        type=str, default=None,
        help="직접 검색할 키워드 (--pain-point 대신 사용)",
    )
    parser.add_argument(
        "--output-dir", "-o",
        type=str, default=None,
        help="결과 저장 디렉토리 (기본: 크롤링 폴더)",
    )
    parser.add_argument(
        "--max-posts", "-m",
        type=int, default=MAX_POSTS_PER_KEYWORD,
        help=f"키워드당 최대 수집 게시글 수 (기본: {MAX_POSTS_PER_KEYWORD})",
    )
    parser.add_argument(
        "--login", action="store_true",
        help="카페 로그인 모드 활성화",
    )
    parser.add_argument("--naver-id", type=str, default=None, help="네이버 아이디")
    parser.add_argument("--naver-pw", type=str, default=None, help="네이버 비밀번호")
    parser.add_argument("--kakao-id", type=str, default=None, help="카카오 아이디")
    parser.add_argument("--kakao-pw", type=str, default=None, help="카카오 비밀번호")
    parser.add_argument(
        "--json-only", action="store_true",
        help="JSON만 출력 (Markdown 생성 안 함)",
    )
    parser.add_argument(
        "--delay", "-d",
        type=float, default=REQUEST_DELAY,
        help=f"요청 간 딜레이 초 (기본: {REQUEST_DELAY})",
    )

    args = parser.parse_args()

    # 딜레이 설정 반영 (config 모듈의 값을 직접 변경)
    import config as _cfg
    _cfg.REQUEST_DELAY = args.delay

    # 출력 디렉토리 설정
    output_dir = args.output_dir or OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, "crawl_results.json")
    md_path = os.path.join(output_dir, "crawl_results.md")

    # 키워드 결정
    if args.keyword:
        keyword_groups = {"custom": [args.keyword]}
    elif args.pain_point:
        keyword_groups = get_keywords(args.pain_point)
    else:
        parser.error("--pain-point 또는 --keyword 중 하나를 지정하세요.")
        return

    # 플랫폼 결정
    if args.platform == "all":
        platforms = ["dcinside", "orbi", "naver_blog"]
    else:
        platforms = [args.platform]

    # ==== 크롤링 실행 ====
    all_results = []

    log("=" * 60)
    log("LEET Pain Point 증거 수집 크롤러 시작")
    log(f"플랫폼: {', '.join(platforms)}")
    log(f"키워드 그룹: {len(keyword_groups)}개, 총 키워드: {sum(len(v) for v in keyword_groups.values())}개")
    log("=" * 60)

    for platform in platforms:
        if platform == "daum_cafe":
            # 다음 카페 (서로연) — Playwright + 카카오 로그인
            if not args.login:
                log("다음 카페(서로연)는 --login 옵션이 필요합니다.", "WARN")
                continue

            cafe = CafeCrawler("daum")
            if not cafe.launch_browser(headless=False):
                continue

            kid = args.kakao_id or os.environ.get("KAKAO_ID", "")
            kpw = args.kakao_pw or os.environ.get("KAKAO_PW", "")
            if not kid or not kpw:
                log("카카오 ID/PW를 --kakao-id, --kakao-pw로 전달하거나 KAKAO_ID, KAKAO_PW 환경변수를 설정하세요.", "ERR")
                cafe.close()
                continue

            if cafe.login_kakao(kid, kpw):
                for group_name, keywords in keyword_groups.items():
                    log(f"\n--- [서로연] [{group_name}] ---")
                    for kw in keywords:
                        posts = cafe.search_daum_cafe(kw, cafe_id="snuleet")
                        for post in posts:
                            result = cafe.get_daum_cafe_post(post["url"])
                            if result and result["content"]:
                                result["keyword"] = kw
                                result["group"] = group_name
                                all_results.append(result)
            else:
                log("카카오 로그인 실패. 브라우저에서 직접 로그인한 후 Enter를 눌러주세요.", "WARN")
                try:
                    input(">>> 로그인 완료 후 Enter: ")
                    for group_name, keywords in keyword_groups.items():
                        log(f"\n--- [서로연] [{group_name}] ---")
                        for kw in keywords:
                            posts = cafe.search_daum_cafe(kw, cafe_id="snuleet")
                            for post in posts:
                                result = cafe.get_daum_cafe_post(post["url"])
                                if result and result["content"]:
                                    result["keyword"] = kw
                                    result["group"] = group_name
                                    all_results.append(result)
                except EOFError:
                    log("비대화형 모드에서는 수동 로그인이 불가합니다. 터미널에서 직접 실행해주세요.", "ERR")
            cafe.close()

        elif platform == "naver_cafe":
            # 네이버 카페 — Playwright + 네이버 로그인
            if not args.login:
                log("네이버 카페는 --login 옵션이 필요합니다.", "WARN")
                continue

            cafe = CafeCrawler("naver")
            if not cafe.launch_browser(headless=False):
                continue

            nid = args.naver_id or os.environ.get("NAVER_ID", "")
            npw = args.naver_pw or os.environ.get("NAVER_PW", "")
            if not nid or not npw:
                log("네이버 ID/PW를 --naver-id, --naver-pw로 전달하거나 NAVER_ID, NAVER_PW 환경변수를 설정하세요.", "ERR")
                cafe.close()
                continue

            if cafe.login_naver(nid, npw):
                for group_name, keywords in keyword_groups.items():
                    log(f"\n--- [네이버카페] [{group_name}] ---")
                    for kw in keywords:
                        posts = cafe.search_cafe(kw)
                        for post in posts:
                            result = cafe.get_post(post["url"])
                            if result and result["content"]:
                                result["keyword"] = kw
                                result["group"] = group_name
                                all_results.append(result)
            cafe.close()
        else:
            # 공개 사이트: requests 기반
            crawler = get_crawler(platform)
            if not crawler:
                log(f"알 수 없는 플랫폼: {platform}", "ERR")
                continue

            for group_name, keywords in keyword_groups.items():
                log(f"\n--- [{platform}] [{group_name}] ---")
                for kw in keywords:
                    try:
                        results = crawler.crawl(kw)
                        for r in results:
                            r["keyword"] = kw
                            r["group"] = group_name
                        all_results.extend(results)
                    except Exception as e:
                        log(f"크롤링 오류 ({kw}): {e}", "ERR")

    # ==== 결과 저장 ====
    log(f"\n{'=' * 60}")
    log(f"수집 완료! 총 {len(all_results)}건")

    if all_results:
        export_json(all_results, json_path)
        if not args.json_only:
            export_markdown(all_results, md_path)
    else:
        log("수집된 결과가 없습니다.", "WARN")

    log("=" * 60)


if __name__ == "__main__":
    main()
