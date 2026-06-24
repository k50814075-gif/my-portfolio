# 10분 배포 가이드

## GitHub

1. github.com 로그인
2. 오른쪽 위 `+` → `New repository`
3. 이름: `my-portfolio`
4. `Create repository`
5. `uploading an existing file` 클릭
6. ZIP을 먼저 압축 해제
7. 안에 있는 파일과 `api`, `lib` 폴더를 모두 끌어다 놓기
8. `Commit changes`

## Vercel

1. vercel.com 로그인
2. `Add New` → `Project`
3. GitHub 저장소 `my-portfolio`의 `Import`
4. 별도 설정 없이 `Deploy`
5. 생성된 `https://....vercel.app` 주소 접속

## 정상 여부 확인

웹주소 뒤에 `/api/health`를 붙여 접속했을 때:

```json
{"ok":true,"service":"my-portfolio", ...}
```

가 보이면 정상입니다.

대시보드 우측 상단의 `시세 갱신`을 누르고
`Yahoo 시세 연결됨`이 표시되면 주가 연동도 정상입니다.
