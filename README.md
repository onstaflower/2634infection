# 2634infection — 감염병 탐구 바인더

> 초등 3학년 과학 4단원 감염병 — 학생용 프로젝트 학습 웹앱

## 🌐 배포 URL
`https://2634infection.pages.dev`

## 🛠️ 기술 스택
- **Frontend**: React 19 + Vite
- **DB**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (미디어 업로드)
- **배포**: Cloudflare Pages (GitHub 연동 자동 배포)

## 📚 12차시 구성
| 단계 | 차시 | 주제 |
|---|---|---|
| 도입 🟠 | 1차시 | 감염병과의 첫 만남 |
| 도입 🟠 | 2차시 | 역사 속 감염병 이야기 |
| 탐구 🟢 | 3차시 | 감염병의 종류 탐구 |
| 탐구 🟢 | 4차시 | 감염 경로 탐구 |
| 탐구 🟢 | 5차시 | 우리 몸의 방어 시스템 |
| 탐구 🟢 | 6차시 | 생활 습관과 감염병 |
| 탐구 🟢 | 7차시 | 사회는 어떻게 대응할까? |
| 적용 🔵 | 8차시 | 감염병 예방 수칙 연구 |
| 적용 🔵 | 9차시 | 예방 캠페인 기획 |
| 적용 🔵 | 10차시 | 캠페인 자료 제작 |
| 발표 🟣 | 11차시 | 발표 및 공유하기 |
| 성찰 🟡 | 12차시 | 성찰 및 포트폴리오 완성 |

## 🚀 로컬 개발

```bash
npm install
npm run dev
```

## 🗄️ Supabase 설정

1. `supabase/schema.sql` 파일을 Supabase Dashboard → SQL Editor에서 실행
2. Storage → New Bucket → 이름: `media` → Public: ON

## ☁️ Cloudflare Pages 배포

### GitHub Actions 자동 배포 설정
Repository Settings → Secrets에 추가:
- `CLOUDFLARE_API_TOKEN`: Cloudflare API 토큰 (Pages 편집 권한)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID

또는 Cloudflare Dashboard에서 직접 GitHub 연동 가능

## 👩‍🏫 교사 대시보드
- URL: `/teacher`
- 기능: 전체 학생 제출 현황, CSV/HTML 다운로드
- ⚠️ 비밀번호는 화면에 표시되지 않습니다

## 🎯 학생 활동 유형
- 📝 텍스트 입력 (자동 저장)
- 🎯 선택형 퀴즈 (즉시 채점)
- ✏️ SVG 스케치패드
- 🎤 Web Speech API 음성 녹음
- 🗺️ 마인드맵
- ✅ 체크리스트
- 📸 사진 업로드

