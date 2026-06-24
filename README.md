# My Portfolio — Vercel 웹사이트 버전

이 프로젝트는 로컬 실행 파일이 아니라 **일반 웹주소로 접속하는 배포용 버전**입니다.

## 주요 기능

- Yahoo Finance 현재가·전일종가 조회
- USD/KRW 환율(`KRW=X`) 반영
- Yahoo 종목 검색
- 보유종목·거래내역·예수금 관리
- 평가손익·오늘의 손익·자산 비중 계산
- 일별 자산 스냅샷
- JSON 백업 내보내기·가져오기
- 모바일·PC 반응형 화면

## 데이터 저장 방식

보유수량, 평균단가, 거래내역과 예수금은 **접속한 브라우저의 localStorage**에 저장됩니다.

- 웹서버에는 개인 잔고가 저장되지 않습니다.
- 같은 PC와 같은 브라우저에서는 계속 유지됩니다.
- 다른 PC나 휴대전화에서는 백업 파일을 내보낸 후 가져오면 됩니다.
- 브라우저 데이터를 삭제하면 잔고도 지워질 수 있으므로 주기적으로 백업하세요.

## 배포 방법 — 브라우저만 사용

### 1. GitHub 저장소 만들기

1. GitHub에 로그인합니다.
2. `New repository`를 선택합니다.
3. 저장소 이름을 예: `my-portfolio`로 입력합니다.
4. Public 또는 Private을 선택한 후 저장소를 만듭니다.
5. 생성된 저장소에서 `Add file → Upload files`를 선택합니다.
6. 이 ZIP을 압축 해제한 뒤 **폴더 안의 모든 파일과 api, lib 폴더**를 업로드합니다.
7. `Commit changes`를 누릅니다.

### 2. Vercel에 배포

1. Vercel에 GitHub 계정으로 로그인합니다.
2. `Add New → Project`를 선택합니다.
3. 방금 만든 GitHub 저장소를 Import합니다.
4. Framework Preset은 `Other` 또는 자동 감지 상태로 둡니다.
5. 별도의 환경변수는 입력하지 않습니다.
6. `Deploy`를 누릅니다.
7. 완료되면 `https://프로젝트명.vercel.app` 주소가 생성됩니다.

## 배포 확인

아래 주소가 JSON으로 열리면 서버리스 함수가 정상입니다.

- `/api/health`
- `/api/quotes?symbols=MU,NVDA,KRW=X`
- `/api/search?q=micron`

## Yahoo Symbol 예시

- 현대차: `005380.KS`
- 삼성전자: `005930.KS`
- SK하이닉스: `000660.KS`
- 코스닥 종목: 보통 `.KQ`
- 마이크론: `MU`
- 엔비디아: `NVDA`
- 원/달러 환율: `KRW=X`

## 참고

Yahoo Finance는 공식 유료 금융 API가 아닌 비공식 웹 데이터 경로를 이용합니다.
Yahoo 측 구조 변경이나 일시적인 호출 제한으로 조회가 실패할 수 있으며,
그 경우 화면은 브라우저에 저장된 마지막 정상 시세를 유지합니다.
