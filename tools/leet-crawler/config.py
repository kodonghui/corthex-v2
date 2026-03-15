"""
LEET Pain Point 증거 수집 크롤러 — 설정 파일
"""

import os

# ============================================================
# 검색 키워드 설정
# ============================================================

KEYWORDS = {
    "pain_point_1_해설불일치": [
        # 해설 불일치 / 신뢰성 문제
        "LEET 해설 다르다",
        "리트 해설 불일치",
        "메가로스쿨 해설 시대인재 해설 다르다",
        "LEET 추리논증 해설 이상하다",
        "LEET 해설 논란",
        "리트 정답 해설 다름",
        "LEET 공식 해설 부족",
        "LEET 해설서 설명 부족",
        "학원 해설 강사 해설 다르다 LEET",
        "리트 해설 누가 맞는거",
        # 가답안 / 오답 논란
        "리트 가답안 오류",
        "LEET 가답안 틀림",
        "리트 정답 논란",
        "LEET 이의제기",
        "리트 복수정답",
        "LEET 정답 바뀜",
        # 해설 품질
        "리트 해설 이해 안됨",
        "LEET 풀이 방법 다름",
        "리트 해설 납득 안됨",
        "LEET 기출 해설 부실",
        "리트 해설지 비교",
        "LEET 해설 여러개",
        "리트 독학 해설 부족",
        # 강사 간 차이
        "리트 강사 풀이 다름",
        "LEET 강사 추천 논란",
        "리트 어떤 강사 해설 믿어야",
        "LEET 강사별 정답 다름",
        "리트 모의고사 질 낮다",
        "LEET 사설 문제 퀄리티",
        "리트 기출 vs 사설",
        "LEET 모의고사 해설 이상",
        "법률저널 해설 오류",
        "LEET 기출백서",
    ],
    "pain_point_2_피드백부재": [
        # 점수 정체 / 안 오름
        "LEET 왜 틀렸는지 모르겠다",
        "리트 점수 안 오른다",
        "LEET 정체 극복",
        "리트 같은 유형 계속 틀림",
        "LEET 오답 분석",
        "리트 110점 벽",
        "리트 120점 벽",
        "리트 130점 벽",
        "LEET 점수 안오름",
        "리트 성적 정체",
        "LEET 실력 제자리",
        "리트 공부해도 안오른다",
        # 장수생 / 재수
        "LEET 장수생 고민",
        "리트 재수 점수 떨어짐",
        "리트 3수 포기",
        "LEET 재수 효과 없다",
        "리트 N수 현실",
        "LEET 멘탈 관리",
        "리트 슬럼프",
        # 피드백 부재
        "LEET 혼자 공부 한계",
        "LEET 피드백 받을 곳 없다",
        "리트 과외 비싸다",
        "리트 과외 효과",
        "LEET 독학 어렵다",
        "리트 스터디 한계",
        "LEET 오답노트 방법",
        "리트 약점 파악 어렵다",
        # AI / 새로운 시도
        "ChatGPT LEET 공부",
        "AI 리트 공부",
        "GPT 추리논증",
        "AI 로스쿨 준비",
        # 구조적 한계
        "리트 인강 한계",
        "LEET 학원 커리큘럼 문제",
        "리트 기출 부족",
        "LEET 문제 수 적다",
    ],
    "pain_point_3_접근성불평등": [
        # 비용 문제
        "LEET 학원비 비싸다",
        "로스쿨 준비 비용 현실",
        "LEET 인강 가격",
        "리트 종합반 가격",
        "LEET 경제적 부담",
        "리트 학원 돈",
        "메가로이어스 올패스 비싸다",
        "리트 돈 없으면",
        "로스쿨 사교육비 부담",
        "LEET 응시료 비싸다",
        "리트 모의고사 응시료",
        "LEET 교재비 부담",
        "로스쿨 학비 비싸다",
        "로스쿨 등록금 부담",
        "로스쿨 대출",
        # 금수저 / 불평등
        "로스쿨 금수저",
        "로스쿨 부모 소득",
        "로스쿨 고소득층",
        "로스쿨 음서제",
        "사법시험 부활 형평성",
        "로스쿨 계층 고착",
        # 지방 불리
        "지방 LEET 준비 불리",
        "LEET 학원 강남 신촌 집중",
        "지방대 로스쿨 불리",
        "지방 리트 정보 부족",
        "지방 로스쿨 준비 환경",
        # 독학 vs 학원
        "리트 독학 vs 학원",
        "LEET 독학 가능한가",
        "리트 독학 합격",
        "LEET 독학 현실",
        "리트 인강만으로 가능",
        "LEET 학원 안가면",
    ],
}

# ============================================================
# 플랫폼별 설정
# ============================================================

PLATFORMS = {
    "dcinside": {
        "name": "디시인사이드 법전원갤러리",
        "base_url": "https://gall.dcinside.com/mgallery/board/lists",
        "gallery_id": "lawschool",
        "search_url": "https://search.dcinside.com/combine/q/{keyword}",
        "mobile_base": "https://m.dcinside.com/board/lawschool",
    },
    "orbi": {
        "name": "오르비",
        "base_url": "https://orbi.kr",
        "search_url": "https://orbi.kr/search?q={keyword}",
    },
    "naver_blog": {
        "name": "네이버 블로그",
        "search_url": "https://search.naver.com/search.naver?where=blog&query={keyword}",
    },
    "tistory": {
        "name": "티스토리",
        "search_url": "https://www.google.com/search?q=site:tistory.com+{keyword}",
    },
    "naver_cafe": {
        "name": "네이버 카페 (서로연 등)",
        "requires_login": True,
        "search_url": "https://cafe.naver.com/ArticleSearchList.nhn?search.query={keyword}&search.cluburl=lawschoolprep",
    },
}

# ============================================================
# HTTP 헤더 (봇 탐지 우회)
# ============================================================

# 디시인사이드용 헤더 (모바일 UA 권장)
DC_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cache-Control": "max-age=0",
    "DNT": "1",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
}

# 범용 헤더
GENERAL_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# ============================================================
# 크롤링 설정
# ============================================================

# 요청 간 딜레이 (초) — 서버 부하 방지
REQUEST_DELAY = 2.0

# 최대 페이지 수 (게시판 탐색 시)
MAX_PAGES = 5

# 최대 게시글 수 (키워드당)
MAX_POSTS_PER_KEYWORD = 20

# 결과 저장 경로
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(OUTPUT_DIR, "crawl_results.json")
OUTPUT_MD = os.path.join(OUTPUT_DIR, "crawl_results.md")

# ============================================================
# 로그인 정보 (네이버/다음 카페용)
# 환경변수 또는 직접 입력
# ============================================================

NAVER_ID = os.environ.get("NAVER_ID", "")
NAVER_PW = os.environ.get("NAVER_PW", "")
KAKAO_ID = os.environ.get("KAKAO_ID", "")
KAKAO_PW = os.environ.get("KAKAO_PW", "")
