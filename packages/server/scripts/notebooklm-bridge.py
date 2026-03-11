#!/usr/bin/env python3
"""
NotebookLM MCP Bridge

stdin으로 JSON 요청 수신 → notebooklm-py 라이브러리 호출 → stdout으로 JSON 응답
TypeScript child_process.spawn에서 호출됨

요청 형식:
{
  "action": "create_notebook" | "add_source" | "generate_audio" | "get_mindmap" | "create_slides" | "summarize",
  "sources": [{"type": "text"|"url"|"file"|"notebook", "content": "...", "title": "..."}],
  "options": {...},
  "credentials": {"googleToken": "..."}
}

응답 형식:
{
  "success": true/false,
  "notebookId": "...",
  "outputUrl": "...",
  "outputData": {...},
  "error": "..."
}
"""

import sys
import json
import os
from pathlib import Path

ALLOWED_FILE_EXTENSIONS = {".pdf", ".txt", ".md", ".doc", ".docx", ".csv", ".html", ".htm"}
MAX_CONTENT_LENGTH = 1_000_000  # 1MB per source
MAX_TITLE_LENGTH = 500
MAX_SOURCES = 50


def validate_source(source):
    """소스 입력 검증 — path traversal, 길이 제한"""
    content = source.get("content", "")
    if len(content) > MAX_CONTENT_LENGTH:
        raise ValueError(f"소스 내용이 최대 길이({MAX_CONTENT_LENGTH}자)를 초과합니다")
    title = source.get("title", "")
    if len(title) > MAX_TITLE_LENGTH:
        raise ValueError(f"소스 제목이 최대 길이({MAX_TITLE_LENGTH}자)를 초과합니다")
    src_type = source.get("type", "text")
    if src_type == "file":
        path = Path(content)
        if not path.suffix.lower() in ALLOWED_FILE_EXTENSIONS:
            raise ValueError(f"허용되지 않는 파일 확장자: {path.suffix}")
        resolved = path.resolve()
        if ".." in str(resolved):
            raise ValueError("경로 탐색(path traversal) 감지됨")


def validate_sources(sources):
    """소스 목록 일괄 검증"""
    if len(sources) > MAX_SOURCES:
        raise ValueError(f"소스는 최대 {MAX_SOURCES}개까지 가능합니다")
    for source in sources:
        validate_source(source)


def create_notebook(sources, options, credentials):
    """여러 소스를 하나의 노트북으로 묶어 생성"""
    try:
        validate_sources(sources)
        from notebooklm import NotebookLM

        client = NotebookLM(token=credentials.get("googleToken", ""))
        title = options.get("title", "New Notebook")

        notebook = client.create_notebook(title=title)
        notebook_id = notebook.id

        for source in sources:
            src_type = source.get("type", "text")
            content = source.get("content", "")
            src_title = source.get("title", "")

            if src_type == "text":
                notebook.add_source(text=content, title=src_title)
            elif src_type == "url":
                notebook.add_source(url=content, title=src_title)
            elif src_type == "file":
                notebook.add_source(file_path=content, title=src_title)

        return {
            "success": True,
            "notebookId": notebook_id,
            "outputData": {
                "title": title,
                "sourceCount": len(sources),
            },
        }
    except ImportError:
        return {
            "success": False,
            "error": "notebooklm-py 패키지가 설치되지 않았습니다. pip3 install notebooklm-py 실행 필요",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def add_source(sources, options, credentials):
    """기존 노트북에 소스 추가"""
    try:
        validate_sources(sources)
        from notebooklm import NotebookLM

        client = NotebookLM(token=credentials.get("googleToken", ""))
        notebook_id = options.get("notebookId", "")

        if not notebook_id:
            return {"success": False, "error": "notebookId가 필요합니다"}

        notebook = client.get_notebook(notebook_id)
        added = 0

        for source in sources:
            src_type = source.get("type", "text")
            content = source.get("content", "")
            src_title = source.get("title", "")

            if src_type == "text":
                notebook.add_source(text=content, title=src_title)
            elif src_type == "url":
                notebook.add_source(url=content, title=src_title)
            elif src_type == "file":
                notebook.add_source(file_path=content, title=src_title)
            added += 1

        return {
            "success": True,
            "notebookId": notebook_id,
            "outputData": {"addedCount": added},
        }
    except ImportError:
        return {
            "success": False,
            "error": "notebooklm-py 패키지가 설치되지 않았습니다",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_audio(sources, options, credentials):
    """노트북/텍스트 → 오디오 브리핑 생성"""
    try:
        from notebooklm import NotebookLM

        client = NotebookLM(token=credentials.get("googleToken", ""))
        style = options.get("style", "briefing")
        topic = options.get("topic", "")
        language = options.get("language", "ko")

        # 노트북 ID가 있으면 기존 노트북 사용, 없으면 텍스트로 임시 노트북 생성
        notebook_id = options.get("notebookId", "")
        if not notebook_id and sources:
            temp = client.create_notebook(title=topic or "Audio Briefing")
            for s in sources:
                if s.get("type") == "text":
                    temp.add_source(text=s["content"], title=s.get("title", ""))
            notebook_id = temp.id

        if not notebook_id:
            return {"success": False, "error": "notebookId 또는 텍스트 소스가 필요합니다"}

        notebook = client.get_notebook(notebook_id)

        # 오디오 생성 (스타일에 따라 길이/형식 조절)
        instructions = ""
        if style == "briefing":
            instructions = f"Create a concise {language} briefing about {topic}. Keep it under 5 minutes."
        elif style == "deep_dive":
            instructions = f"Create a deep-dive analysis in {language} about {topic}. 10-15 minutes."
        elif style == "conversation":
            instructions = f"Create a conversation-style podcast in {language} about {topic}. 15-20 minutes."

        audio = notebook.generate_audio(instructions=instructions)

        return {
            "success": True,
            "notebookId": notebook_id,
            "outputUrl": audio.url if hasattr(audio, "url") else str(audio),
            "outputData": {
                "style": style,
                "topic": topic,
                "language": language,
                "durationSeconds": getattr(audio, "duration_seconds", None),
            },
        }
    except ImportError:
        return {
            "success": False,
            "error": "notebooklm-py 패키지가 설치되지 않았습니다",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_mindmap(sources, options, credentials):
    """마인드맵 데이터 생성 (Mermaid/JSON 포맷)"""
    try:
        from notebooklm import NotebookLM

        client = NotebookLM(token=credentials.get("googleToken", ""))
        fmt = options.get("format", "mermaid")

        notebook_id = options.get("notebookId", "")
        if not notebook_id and sources:
            temp = client.create_notebook(title="Mindmap")
            for s in sources:
                if s.get("type") == "text":
                    temp.add_source(text=s["content"], title=s.get("title", ""))
            notebook_id = temp.id

        if not notebook_id:
            return {"success": False, "error": "notebookId 또는 텍스트 소스가 필요합니다"}

        notebook = client.get_notebook(notebook_id)
        mindmap = notebook.get_mindmap()

        output_data = mindmap
        if fmt == "mermaid" and hasattr(mindmap, "to_mermaid"):
            output_data = mindmap.to_mermaid()
        elif fmt == "json" and hasattr(mindmap, "to_dict"):
            output_data = mindmap.to_dict()

        return {
            "success": True,
            "notebookId": notebook_id,
            "outputData": output_data,
        }
    except ImportError:
        return {
            "success": False,
            "error": "notebooklm-py 패키지가 설치되지 않았습니다",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def create_slides(sources, options, credentials):
    """프레젠테이션 슬라이드 생성"""
    try:
        from notebooklm import NotebookLM

        client = NotebookLM(token=credentials.get("googleToken", ""))
        slide_count = options.get("slideCount", 10)
        style = options.get("style", "professional")

        notebook_id = options.get("notebookId", "")
        if not notebook_id and sources:
            temp = client.create_notebook(title="Slides")
            for s in sources:
                if s.get("type") == "text":
                    temp.add_source(text=s["content"], title=s.get("title", ""))
            notebook_id = temp.id

        if not notebook_id:
            return {"success": False, "error": "notebookId 또는 텍스트 소스가 필요합니다"}

        notebook = client.get_notebook(notebook_id)
        slides = notebook.create_slides(
            count=slide_count,
            style=style,
        )

        return {
            "success": True,
            "notebookId": notebook_id,
            "outputUrl": slides.url if hasattr(slides, "url") else str(slides),
            "outputData": {
                "slideCount": slide_count,
                "style": style,
            },
        }
    except ImportError:
        return {
            "success": False,
            "error": "notebooklm-py 패키지가 설치되지 않았습니다",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def summarize(sources, options, credentials):
    """노트북/텍스트 요약"""
    try:
        from notebooklm import NotebookLM

        client = NotebookLM(token=credentials.get("googleToken", ""))
        max_length = options.get("maxLength", 500)

        notebook_id = options.get("notebookId", "")
        if not notebook_id and sources:
            temp = client.create_notebook(title="Summary")
            for s in sources:
                if s.get("type") == "text":
                    temp.add_source(text=s["content"], title=s.get("title", ""))
            notebook_id = temp.id

        if not notebook_id:
            return {"success": False, "error": "notebookId 또는 텍스트 소스가 필요합니다"}

        notebook = client.get_notebook(notebook_id)
        summary = notebook.summarize(max_length=max_length)

        return {
            "success": True,
            "notebookId": notebook_id,
            "outputData": {
                "summary": str(summary),
                "maxLength": max_length,
            },
        }
    except ImportError:
        return {
            "success": False,
            "error": "notebooklm-py 패키지가 설치되지 않았습니다",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


ACTION_HANDLERS = {
    "create_notebook": create_notebook,
    "add_source": add_source,
    "generate_audio": generate_audio,
    "get_mindmap": get_mindmap,
    "create_slides": create_slides,
    "summarize": summarize,
}


def main():
    try:
        raw = sys.stdin.read()
        if not raw.strip():
            print(json.dumps({"success": False, "error": "빈 요청입니다"}))
            sys.exit(1)

        request = json.loads(raw)
        action = request.get("action", "")
        sources = request.get("sources", [])
        options = request.get("options", {})
        credentials = request.get("credentials", {})

        handler = ACTION_HANDLERS.get(action)
        if not handler:
            print(
                json.dumps(
                    {
                        "success": False,
                        "error": f"알 수 없는 액션: {action}. 지원: {list(ACTION_HANDLERS.keys())}",
                    }
                )
            )
            sys.exit(1)

        result = handler(sources, options, credentials)
        print(json.dumps(result, ensure_ascii=False))

    except json.JSONDecodeError:
        print(json.dumps({"success": False, "error": "요청 형식 오류: 유효한 JSON이 아닙니다"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"브릿지 오류: {str(e)}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
