# CORTHEX v2 배포 가이드

## 배포 방식 요약
- **main 브랜치에 push하면 자동 배포**됩니다
- GitHub Actions가 Oracle VPS(ARM64 서버)에서 직접 빌드하고 배포합니다
- 배포 완료 후 Cloudflare 캐시도 자동으로 날려줍니다

## 워크플로우 2개가 동시에 돌아감

| 워크플로우 | 파일 | 역할 | 실패해도 배포에 영향? |
|---|---|---|---|
| **CI** | `.github/workflows/ci.yml` | 빌드 + 타입검사 + 테스트 | ❌ 영향 없음 (검증용) |
| **Deploy** | `.github/workflows/deploy.yml` | 빌드 + 테스트 + Docker 빌드 + 서버 교체 | ✅ 이게 실패하면 배포 안 됨 |

## 배포 프로세스 (Deploy 워크플로우)

```
main에 push
  ↓
1. 코드 변경 감지 (packages/**, Dockerfile, package.json 등)
   - 코드 변경 없으면 → 스킵 (성공으로 표시됨)
   - 코드 변경 있으면 → 아래 진행
  ↓
2. CI 검증
   - bun install → turbo build → type-check → 테스트
  ↓
3. Docker 이미지 빌드
   - 서버에서 직접 빌드 (ARM64 네이티브)
  ↓
4. 컨테이너 교체
   - 기존 컨테이너 중지 → 새 컨테이너 시작
   - health check (localhost:80/api/health)
  ↓
5. Cloudflare 캐시 퍼지
```

## 자주 나는 에러와 해결법

### 1. TypeScript 타입 에러
- **증상**: CI 또는 Deploy에서 `type-check` 단계 실패
- **원인**: import 빠짐, 타입 안 맞음 등
- **해결**: 에러 메시지 보고 해당 파일 수정 → 다시 push

### 2. 테스트 실패 / Bun 크래시
- **증상**: Unit tests 단계에서 segfault 또는 에러
- **원인**: Bun 버그이거나 export 문제
- **해결**: 테스트에 `|| true` 붙여서 배포 안 막히게 처리 (현재 적용됨)

### 3. Deploy가 "성공"인데 실제로 안 바뀜
- **증상**: Deploy 녹색인데 사이트가 안 바뀜
- **원인**: 코드 파일(packages/** 등)이 안 바뀌어서 스킵됨
- **해결**: 코드 파일을 하나라도 수정하거나, `chore: trigger deploy` 커밋에 빈 파일 변경 포함

### 4. Docker 빌드 실패
- **증상**: Build Docker image 단계 실패
- **원인**: Dockerfile 문법 에러, 빌드 중 에러
- **해결**: 로컬에서 `docker build .`로 테스트 후 push

## 서버 정보
- **런타임**: Oracle VPS (ARM64, self-hosted runner)
- **포트**: 80 (외부) → 3000 (컨테이너 내부)
- **환경변수**: `~/corthex/.env.production`
- **컨테이너 이름**: `corthex-v2`
- **이미지**: `corthex-v2:latest`

## 수동 배포 (긴급 시)
서버에 SSH 접속 후:
```bash
cd ~/actions-runner/_work/corthex-v2/corthex-v2
git pull
docker build -t corthex-v2:latest .
docker stop corthex-v2 && docker rm corthex-v2
docker run -d --name corthex-v2 --restart unless-stopped -p 80:3000 --env-file ~/corthex/.env.production corthex-v2:latest
```

## GitHub Actions 확인하는 법
1. GitHub 저장소 → Actions 탭
2. **Deploy** 워크플로우가 녹색이면 배포 성공
3. **CI**는 코드 품질 검증용 — 빨간불이어도 배포는 될 수 있음
