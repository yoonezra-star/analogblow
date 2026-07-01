# 운정라이프 애드센스 승인 전 최종 체크리스트

기준일: 2026-07-01

## 현재 완료된 항목

- 모바일 전체 QA 완료: 90개 HTML 페이지에서 가로 넘침, 제목 과폭, 이미지/캡션 겹침, 물음표 깨진 문구 없음.
- 내부 링크/메타 QA 완료: title, description, h1, canonical, 내부 링크 오류 0건.
- sitemap 확인 완료: 공개 HTML 89개와 `sitemap.xml` URL 89개가 일치.
- `robots.txt` 확인 완료: 전체 허용 및 sitemap 선언 정상.
- `ads.txt` 확인 완료: `google.com, pub-1441018945572157, DIRECT, f08c47fec0942fa0`.
- 네이버 지도 페이지 로컬 확인 완료: `http://127.0.0.1:4199/map-search.html`에서 지도 로딩 정상.
- 네이버 지도 운영 확인 완료: `https://analogblow.com/map-search`에서 지도 상태 `ready`, 네이버 지도 타일 표시 정상.
- 새 NCP Key 운영 origin 인증 확인 완료: `rgd9ajy97r`가 `https://analogblow.com`에서 스크립트 200, 지도 초기화, 타일 표시 정상.
- 모바일 첫 화면 개선 완료: 홈 히어로, 상세 글 제목, 이미지 카드, 하단 고정 메뉴 여백 보정.
- 글 상세 공통 신뢰 요소 보강: 21개 글에 정보 확인 안내, 사업자/고객지원 푸터, 편집 기준 링크 정리.

## 배포 직전 확인

1. Cloudflare Pages 또는 배포 환경에 최신 파일 반영.
2. Cloudflare 캐시 삭제: `Purge Cache`.
3. 운영 도메인 확인:
   - `https://analogblow.com`
   - `https://analogblow.com/map-search`
   - `https://analogblow.com/ads.txt`
   - `https://analogblow.com/robots.txt`
   - `https://analogblow.com/sitemap.xml`
4. `www` 접속 시 apex 도메인으로 리다이렉트되는지 확인:
   - `https://www.analogblow.com` -> `https://analogblow.com`
   - 2026-07-01 현재 확인 결과: `www`가 301이 아니라 200으로 열림.
   - Cloudflare Pages `_redirects`만으로는 도메인 레벨 리다이렉트가 적용되지 않으므로 Cloudflare Bulk Redirects에서 별도 설정 필요.
5. 네이버 지도 운영 도메인 확인:
   - 지도 타일이 실제 네이버 지도로 보이는지
   - 인증 실패 안내가 뜨지 않는지
   - 검색, 필터, 네이버 지도 링크가 동작하는지

## NCP 지도 설정

현재 프론트 Key ID:

```text
rgd9ajy97r
```

참고:

- 현재 운영 배포본은 아직 이전 Key `51mdt49cgt`를 사용 중이지만 지도는 정상입니다.
- 로컬 수정본 배포 후에는 새 Key `rgd9ajy97r`로 전환됩니다.
- 2026-07-01 기준 새 Key도 `https://analogblow.com` origin에서 인증 및 지도 타일 로딩을 확인했습니다.

NCP Maps Web 서비스 URL 권장 등록값:

```text
https://analogblow.com
http://127.0.0.1:4199
http://localhost:4199
```

- `https://www.analogblow.com`은 Cloudflare에서 apex로 리다이렉트되면 필수는 아닙니다.
- NCP 콘솔에서 `www` 등록이 허용되면 함께 넣어도 좋습니다.

## Cloudflare 권장값

- SSL/TLS: `Full` 또는 `Full (strict)`.
- Always Use HTTPS: 켜기.
- `www -> apex` 리다이렉트는 Cloudflare Bulk Redirects에서 설정.
  - Source URL: `www.analogblow.com`
  - Target URL: `https://analogblow.com`
  - Status: `301`
  - Parameters: Preserve query string, Subpath matching, Preserve path suffix, Include subdomains.
- DNS에서 `www` 레코드는 Cloudflare 프록시 상태로 유지.
- 지도 문제가 생기면 우선 Rocket Loader, JS minify, Zaraz/스크립트 최적화 기능을 꺼서 재확인.
- 배포 후 캐시 삭제.

## 애드센스 신청 직전 10분 점검

- 홈 페이지가 모바일에서 바로 읽기 편한지 확인.
- 병원/아이생활/맛집/지도/정책 카테고리 각 1개씩 열기.
- 최신 글 3개 열기.
- 문의, 개인정보처리방침, 이용안내, 편집 기준 페이지 열기.
- 광고 스크립트가 삽입되어 있으나 빈 광고 박스가 과하게 보이지 않는지 확인.
- 운영 도메인에서 `ads.txt`가 200 응답인지 확인.
- 운영 도메인에서 `sitemap.xml`이 200 응답인지 확인.

## 남은 리스크

- `https://www.analogblow.com`이 아직 apex로 301 리다이렉트되지 않습니다. 검색 중복 방지를 위해 Cloudflare Bulk Redirects 설정이 필요합니다.
- 운영 배포 후 Cloudflare 캐시나 JS 최적화가 네이버 지도 로딩에 영향을 줄 수 있습니다.
- 로컬 QA는 통과했지만, 실제 운영 도메인에서 반드시 한 번 더 모바일 확인이 필요합니다.
- 일부 오래된 글의 본문 자체가 과거 인코딩 이슈로 생성된 흔적이 있을 수 있으므로, 상위 노출 대상 글은 별도 본문 품질 점검을 권장합니다.
