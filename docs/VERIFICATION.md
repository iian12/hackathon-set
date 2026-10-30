# 실제 실행 기록

검증일: 2026-10-30 (Asia/Seoul). 본시험일: 2026-10-31.

## 환경

- 초기 상태: 로컬 파일·커밋 없음, 원격 공개 저장소 `iian12/hackathon-set`도 비어 있음.
- Windows, Node 24.14.0, npm 11.9.0, Git 2.53.0.windows.2.
- Codex 0.165.0-alpha.1.2 조회만 수행. Codex 업데이트·모델 변경 없음.
- npm 정확한 버전 설치: 121개 추가, audit 0 vulnerabilities(실행 당시 결과).
- Chromium 156.0.8078.4 / Playwright browser revision 1248 설치.

## 원래 작업 폴더에서 성공

| 실행 / 확인 | 실제 결과 |
| --- | --- |
| `npm test` | 단위 테스트 6개 통과 |
| `npm run build` | Vite 프로덕션 빌드 통과, CSS 초기 경고 수정 후 경고 없음 |
| `npm run test:port` | 0.0.0.0:3000을 선점했을 때 비정상 종료, 3001로 이동하지 않음 |
| `npm run test:e2e` | Chromium 브라우저 테스트 18개 통과 |
| `npm run verify:live` | 실행 중 미리보기 서버에서 E2E 18개와 MCP 7단계 통과 |
| `npm run test:skills` | 프로젝트 스킬 3개의 이름·설명·본문·미완성 문구 검사 통과 |
| `codex mcp list`, `codex mcp get playwright` | 프로젝트 playwright 서버 enabled, stdio 설정 인식 |
| 실제 MCP `initialize`, `tools/list` | 연결 및 도구 목록 수신 성공 |
| MCP snapshot/type/click/screenshot | 페이지 구조·입력·확인 결과·PNG 저장 성공 |
| 콘솔 확인 | 앱 Errors: 0. 이어서 의도적 프로브 오류가 수집됨을 별도 확인 |
| 미리보기 서버 비교 | 미리보기 탭 / MCP 화면 / HTTP `serverId` 일치 |

첫 번째 미리보기와 MCP에서 일치한 ID: `683002ca-072e-4acc-ae41-bb1c95534b22`. 실행마다 ID는 달라집니다.

E2E 동작: To-Do와 대시보드의 CRUD, 필터, 새로고침 후 유지, 빈 입력, 검색 결과 없음, 숫자 정렬, 필터 결과 CSV 다운로드 내용, 잘못된 파일 10종의 기존 데이터 보존, 로컬 저장 데이터 손상·쓰기 실패, 모바일 페이지 가로 넘침. 각 테스트에서 브라우저 console.error와 pageerror도 확인했습니다.

## 발견한 실패와 해결

| 최초 실패 | 처리 / 최종 상태 |
| --- | --- |
| 제한 샌드박스의 Git DNS·로컬 HTTP 준비 대기 | 허용된 네트워크 실행 환경에서 재실행하여 성공 |
| 테스트 서버가 남아 3000 포트 충돌 | 이 작업에서 띄운 프로세스를 확인해 종료한 뒤 재실행 성공. 자동 포트 이동 없음 |
| full Chrome 실행 `spawn UNKNOWN` | 실제 E2E가 사용하는 headless shell 실행 파일을 public launchServer API로 찾도록 수정. MCP 브라우저 실행 성공 |
| MCP 입력 도구에 `ref` 전달 시 스키마 오류 | 설치 버전의 tools/list를 읽고 `target`으로 수정. 스크린샷 `scale: css`도 명시. 모두 성공 |
| CSS의 빈 import 경고 | 빈 import 제거 후 빌드 성공 |
| Python 공식 스킬 검사 실행 불가 / 임시 Node yaml 모듈 검사 실패 | 사용 가능한 Python 없음, yaml 패키지 없음. 의존성 없는 Node 스킬 구조 검사로 대체하여 통과 |

## 새 원격 클론

아직 수행 전입니다. 원격 반영 후 새 폴더의 설치·실행·검증 결과를 아래에 기록합니다.

## 미검증 / 한계

- 실제 본시험 OS, 설치 권한, 네트워크 정책, 플랫폼 3000번 포트 프록시는 아직 접근하지 못했습니다.
- 본시험 문제와 채점 조건은 미공개이므로 연습 예제가 실제 답안을 검증하지는 않습니다.
- 프로젝트 스킬 파일 구조는 검사했지만, 본시험 제공 Codex가 자동으로 선택하는지는 미검증입니다. 시작 프롬프트로 직접 읽을 수 있습니다.
- MCP는 실제 stdio SDK 클라이언트로 도구를 호출했습니다. 이 채팅의 도구 목록에 새로운 MCP가 자동 추가되었다고 주장하지 않습니다. 프로젝트 설정은 Codex CLI에서 enabled로 확인했습니다.
- Chromium/Windows 검증입니다. Firefox, WebKit, 다른 OS의 실행 결과는 없습니다.
- Python 기반 공식 스킬 validator는 실행하지 못했습니다.

상세 실행 산출물은 커밋하지 않습니다: `artifacts/mcp/`, `playwright-report/`, `test-results/`.
