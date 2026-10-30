# Cofa AI Native 시험 준비 저장소

2026-10-31 시험을 위한 React 최소 템플릿, 작은 공통 도구, 별도 연습 예제입니다. 실제 문제를 받은 뒤 직접 구현하는 출발점입니다. 기본 모델 **6.1 Sol**과 제공된 **Codex 버전 유지**를 전제로 하며, 모델 변경이나 Codex 업데이트 명령은 없습니다.

## 바로 시작

Node **22.12 이상**이 필요합니다. 실제 검증 환경은 Windows / Node **24.14.0** / npm **11.9.0**입니다. 시험 환경의 기존 버전을 먼저 확인하고 설치·네트워크 허용 범위 안에서 진행하세요.

```sh
git clone https://github.com/iian12/hackathon-set.git
cd hackathon-set
node --version
npm --version
codex --version
npm ci
npm run browser:install
npm run check
npm run dev
```

각 명령이 성공한 뒤 다음 명령을 실행합니다. `check`는 자체 앱 서버를 실행하고 종료하므로 **3000번 포트가 비어 있을 때** 실행합니다. `dev`는 계속 실행하는 명령입니다. 미리보기에서 **3000번 포트**를 열거나 [로컬 앱](http://localhost:3000)을 확인하세요. Vite는 `0.0.0.0:3000`, `strictPort: true`로 고정되어 충돌하면 실패합니다.

Linux에서 브라우저 시스템 라이브러리 누락이 발생하고 설치가 허용된다면 `npx --no-install playwright install --with-deps chromium`을 사용합니다. 관리자 설치가 금지되어 있으면 환경 제공 브라우저를 사용하거나 미검증 항목을 기록합니다. `npm ci`나 브라우저 설치가 불가능할 때 성공으로 간주하지 않습니다.

## 구현 위치와 연습 예제

| 구분 | 위치 | 용도 |
| --- | --- | --- |
| 최소 시작점 | `src/starter/Starter.jsx`, `/` | 실제 문제 화면을 직접 구현할 곳. 연습 데이터 없음 |
| 공통 코드 | `src/shared/` | CSV 읽기·검증·내보내기, 정렬·검색·필터, 표, 오류·빈 상태, 로컬 저장 |
| 교체할 규칙 | `src/domain/` | CSV 스키마·행 검증, 저장 키, To-Do 검증 |
| 완성 연습 예제 | `src/practice/`, `/practice/todo`, `/practice/csv` | 동작을 연습하는 참고 구현 |
| 가상 샘플 | `public/samples/sales.csv` | 실제 문제 데이터와 분리된 연습 CSV |
| 요구사항 기록 | `docs/REQUIREMENTS.md` | 실제 문제의 합격 조건과 검증 결과 작성 |
| 스킬 없이 시작 | [시작 프롬프트](docs/START_PROMPT.ko.md) | 복사하고 문제 원문을 붙여 넣기 |

순서: **요구사항 정리 → 최소 구현 → 실행 → 브라우저 검증 → 수정 → 최종 확인**.

`App.jsx`의 루트 분기를 실제 답안에 연결합니다. 제출물에 연습 메뉴가 필요 없으면 `App.jsx`의 연습 import·분기·링크를 제거하고 실제 화면만 연결하세요. 공통 도구의 인터페이스는 예제를 참고하되, 예제의 판단 규칙을 본시험 규칙으로 사용하지 마세요.

## 공통 코드 사용

```js
import { readCsvFile, downloadCsv } from './shared/csv.js';
import { selectRows } from './shared/table.js';

const columns = [{ key: 'title', label: '제목' }, { key: 'score', label: '점수' }];
const schema = {
  columns,
  validateRow: row => row.title && Number.isFinite(Number(row.score)) ? [] : ['제목과 점수를 확인하세요'],
};
const rows = await readCsvFile(file, schema); // 실패하면 throw. 성공한 다음에만 상태 교체
const visible = selectRows(rows, { query: '검색어', sortKey: 'score', numericKeys: ['score'] });
downloadCsv(visible, columns, 'result.csv');
```

- CSV는 UTF-8, 2MB 이하, 데이터 10,000행 이하, 쉼표 구분입니다. BOM·따옴표·필드 내 쉼표/줄바꿈은 Papa Parse로 처리합니다. 파일 확장자·크기·인코딩·헤더·행 너비·문제별 값을 검증합니다.
- 필수 헤더 누락, 중복/빈 헤더, 잘못된 행은 전체 업로드 실패로 처리하며 기존 데이터를 보존합니다. 추가 열은 파서가 허용하지만 **연습 대시보드는 선언한 열만 보관**합니다. 문제 요구에 맞게 바꾸세요.
- `DataTable`에는 안정적인 `id`를 가진 행과 `columns`, 정렬 상태, `onSort`를 전달합니다. 검색·필터·정렬 상태는 상위 컴포넌트가 소유합니다. 숫자 열은 `numericKeys`로 지정합니다.
- 다운로드는 현재 검색·필터·정렬 결과를 UTF-8 BOM CSV로 내보냅니다. 스프레드시트 수식 실행 방지를 위해 `=`, `+`, `-`, `@` 등으로 시작하는 값은 이스케이프합니다. 원본 문자열의 완전한 보존이 필요한 문제에서는 이 정책을 명시적으로 재검토하세요.
- 연습의 영속성은 **같은 브라우저·같은 origin의 localStorage**입니다. 다른 브라우저/MCP 격리 세션/미리보기 호스트와 공유되지 않습니다. 서버 DB나 다중 사용자 동기화 요구는 별도로 구현해야 합니다. 저장 실패·저장 데이터 손상은 화면에 표시합니다.

## Playwright MCP 연결

프로젝트 `.codex/config.toml`에 비밀정보 없는 MCP 설정이 들어 있습니다. 저장소 루트에서 실행하고 프로젝트를 신뢰한 상태에서 확인합니다. 신뢰 여부는 시험 환경의 정책을 따르세요.

```sh
codex mcp list
codex mcp get playwright
```

`playwright`가 `enabled`여야 합니다. `Auth: Unsupported`는 로그인 기능 없는 로컬 stdio 서버의 표시입니다. 이것만으로 브라우저 연결 성공을 뜻하지는 않습니다.

```toml
[mcp_servers.playwright]
command = "node"
args = ["scripts/start-mcp.mjs"]
startup_timeout_sec = 30
tool_timeout_sec = 60
```

클라이언트에 MCP 도구가 나타나지 않으면 해당 에디터/Codex 세션을 다시 열고 확인하세요. 프로젝트 설정을 지원하지 않는 버전에서는 **시험 정책이 허용하는 경우에만** 아래 사용자 범위 등록을 사용합니다. Codex를 업데이트하지 않습니다.

PowerShell:

```powershell
$launcher = (Resolve-Path .\scripts\start-mcp.mjs).Path
codex mcp add playwright -- node $launcher
```

Linux/macOS:

```sh
codex mcp add playwright -- node "$PWD/scripts/start-mcp.mjs"
```

다른 MCP 클라이언트용 일반 예시는 `config/mcp.json.example`에 있습니다. 그 클라이언트의 설정 형식을 확인하고 절대 경로를 현지에서 지정하세요. 개인 절대 경로·인증정보가 든 설정은 커밋하지 마세요.

`scripts/start-mcp.mjs`는 잠금 파일에 고정된 MCP를 stdio로 실행합니다. 짧은 Playwright `launchServer` 프로브로 **E2E와 같은 headless Chromium 실행 파일**을 찾고 닫은 뒤 MCP에 전달합니다. 이 Windows 환경에서는 full Chrome 직접 실행이 `spawn UNKNOWN`으로 실패했으나 headless shell로 해결했습니다. 시스템 경로와 내부 브라우저 레지스트리를 하드코딩하지 않습니다.

서버가 실행 중인 상태에서 다른 터미널:

```sh
npm run test:mcp
```

실제 MCP `initialize`·`tools/list`·페이지 구조 읽기·입력·클릭·스크린샷·콘솔 확인·HTTP/화면 서버 ID 비교를 수행합니다. MCP SDK를 쓰므로 에디터가 새 MCP를 아직 도구 목록에 로드하지 않은 경우에도 연결 자체를 검증할 수 있습니다. 에디터 안의 도구 로딩은 별도로 `codex mcp list`와 실제 호출로 확인하세요.

고정 버전 `0.0.83`의 클릭/입력 도구는 스냅샷의 `ref=e...` 값을 **`target` 인수**에 넣습니다. 스크린샷에는 `scale: 'css'`가 필요합니다. 다른 버전을 임의 설치하지 말고 `tools/list`의 실제 스키마를 확인하세요.

증거 파일(커밋 제외): `artifacts/mcp/result.json`, `transcript.json`, `tools.json`, `starter.png`. 애플리케이션 콘솔이 깨끗한지 확인한 뒤 고의적인 `COFA_EXPECTED_CONSOLE_PROBE` 오류를 한 번 발생시켜 오류 수집 도구 자체도 작동하는지 확인합니다. 이 프로브는 정상 앱 오류와 구분해 결과에 남깁니다.

## 미리보기와 같은 앱인지 확인

1. `npm run dev` 서버 하나를 실행합니다. E2E 자동 서버와 동시에 띄우지 않습니다.
2. 미리보기의 **서버 확인**을 펼쳐 ID를 읽습니다.
3. MCP에서 `http://localhost:3000`을 열고 화면의 `data-testid="server-id"`와 `/__server_identity` JSON의 `serverId`를 비교합니다.
4. 세 값이 같아야 같은 서버 프로세스입니다. `npm run test:mcp`가 HTTP/MCP/화면 비교를 자동 수행합니다. 미리보기의 ID는 직접 비교합니다.

실제 시험의 미리보기가 프록시 주소라면 브라우저 origin이 달라도 같은 ID여야 합니다. 지금 검증한 로컬 미리보기가 본시험 플랫폼 연결까지 보장하지는 않습니다. 재시작하면 ID가 바뀝니다. `/__server_identity`는 개발 서버용이며 `npm run preview`의 정적 빌드에는 없습니다.

## 반복 검증

| 상황 | 명령 | 범위 |
| --- | --- | --- |
| 서버가 꺼져 있음 | `npm run check` | 스킬 구조 → 단위 6개 → 빌드 → 포트 충돌 → Chromium E2E 18개 |
| 미리보기 서버 실행 중 | `npm run verify:live` | 기존 서버 대상 E2E 18개 → MCP 7단계 |
| 데이터 처리만 변경 | `npm test` | CSV 파싱·검증·이스케이프·정렬 |
| 스킬 구조 | `npm run test:skills` | 3개 스킬의 이름/설명/본문/미완성 문구 검사 |
| 새 서버를 직접 테스트 | `npm run test:e2e` | 알 수 없는 기존 서버 재사용 금지 |
| 실패 화면 확인 | `npx --no-install playwright show-report` | HTML 보고서, 실패 스크린샷/trace |
| 빌드 결과 보기 | `npm run build`, 이후 `npm run preview` | 개발 서버 종료 후 같은 3000번 포트에서 실행 |

E2E는 To-Do 추가·수정·완료·필터·삭제·새로고침, 빈 추가/수정, 대시보드 CRUD·검색·분류·숫자 정렬·다운로드 내용·영속성, 잘못된 파일 10종, 저장 손상/실패, 모바일 페이지 넘침을 검사합니다. 모든 E2E에서 `console.error`와 `pageerror`도 검사합니다. 성공했다고 말하기 전에 종료 코드와 결과를 확인하세요.

## 새 폴더 클론으로 재검증

기존 서버를 그 터미널에서 `Ctrl+C`로 종료한 뒤 **기존 폴더와 다른 새 폴더**를 사용하세요. Windows에서는 한 터미널에서 새 폴더 명령을 순서대로 실행하고, `dev` 실행 후 두 번째 터미널에서 같은 새 폴더로 이동합니다.

```sh
git clone https://github.com/iian12/hackathon-set.git exam-clean
cd exam-clean
npm ci
npm run browser:install
npm run check
npm run dev
```

다른 터미널:

```sh
cd exam-clean
codex mcp get playwright
npm run verify:live
```

새 클론의 미리보기 ID와 MCP 결과 ID를 비교하세요. 브라우저 실행 파일은 OS 캐시에서 재사용될 수 있지만 소스/`node_modules`는 새 클론에서 새로 설치됩니다. 실제 수행 기록은 [검증 기록](docs/VERIFICATION.md)에 있습니다.

## 스킬과 프롬프트

프로젝트 스킬은 `.agents/skills/`에 **web-implementation / browser-verification / csv-data** 3개만 둡니다. 루트 `AGENTS.md`는 짧은 작업 규칙입니다. 스킬 인식이 안 되어도 [시작 프롬프트](docs/START_PROMPT.ko.md)는 파일을 직접 읽도록 안내합니다. 이 PC에 사용 가능한 Python이 없어 공식 Python 스킬 검증기는 실행하지 못했으며, 저장소의 Node 검사로 구조를 확인했습니다. 이는 모델이 스킬을 자동 선택했다는 검증과는 다릅니다.

설정과 스킬 위치는 [공식 MCP 문서](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [공식 스킬 문서](https://learn.chatgpt.com/docs/build-skills)를 참고했습니다. Playwright 옵션은 [공식 Playwright MCP 저장소](https://github.com/microsoft/playwright-mcp)와 설치된 버전의 `--help`, `tools/list`로 확인했습니다.

## 문제 해결

- **Port 3000 is already in use**: 실행 중인 이 프로젝트 터미널을 확인하세요. Windows: `Get-NetTCPConnection -State Listen -LocalPort 3000`, Linux: `lsof -i :3000`. 소유 프로세스를 식별하고 필요한 경우 자신이 띄운 서버만 종료합니다. 다른 포트로 바꾸지 않습니다.
- **서버가 있는데 test:e2e 실패**: 의도한 보호 동작입니다. 서버 종료 후 `npm run check` 또는 명시적으로 `npm run verify:live`를 사용합니다.
- **이 Codex 데스크톱 샌드박스에서 fetch 실패/준비 대기**: 최초 제한 실행에서는 서버 소켓이 정상 접근되지 않았고, 허용된 로컬 네트워크 실행으로 해결했습니다. 시험 환경에서도 권한 오류와 앱 오류를 구분하고 해당 환경이 허용한 터미널·실행 경로를 사용하세요.
- **브라우저가 없음**: `npm run browser:install`. 다운로드가 금지되면 제공 브라우저나 설치 허용 절차를 확인하고 브라우저 검증을 미검증으로 기록합니다.
- **MCP spawn UNKNOWN**: 제공한 launcher를 사용하세요. full Chrome 경로를 강제하지 않습니다. launcher 자체 실패 시 `npm run browser:install`과 OS 실행 권한을 먼저 확인하세요.
- **MCP 도구 인수 오류**: `artifacts/mcp/tools.json`과 스냅샷을 확인합니다. 고정 버전의 `target`, 스크린샷 `scale` 스키마를 따릅니다.
- **미리보기가 다름/새로고침이 안 됨**: 서버 ID·3000 포워딩·실행 폴더를 확인합니다. 개발 서버 프로세스 하나만 사용하고, 임의의 다른 호스트를 허용하는 Vite 설정을 추가하지 마세요.
- **CSV 인코딩 오류**: UTF-8 CSV로 다시 저장합니다. 빈/중복 헤더, 열 수, 숫자 값을 오류 메시지에 따라 수정합니다.
- **저장 데이터가 다름**: localhost와 127.0.0.1, 미리보기 도메인, MCP 격리 브라우저는 저장 영역이 다를 수 있습니다. 새로고침 영속성은 같은 origin 안에서 검사합니다.

## 버전과 공개 범위

직접 의존성은 정확한 버전이며 전이 의존성은 `package-lock.json`에 고정되어 있습니다. `npm ci`를 사용하고 `npm update`, `npm audit fix --force`, `@latest` 재설치를 시험 직전에 실행하지 마세요. `.node-version`은 검증 환경 기록이며 시험 환경의 런타임 변경을 요구하지 않습니다.

| 패키지 | 검증 버전 |
| --- | --- |
| React / React DOM | 19.3.1 |
| Vite / React 플러그인 | 8.3.5 / 6.1.2 |
| Playwright Test | 1.64.1 |
| Playwright MCP | 0.0.83 |
| MCP SDK | 1.32.2 |
| Papa Parse | 5.7.0 |

MCP 자체는 Playwright alpha 의존성을 포함합니다. launcher가 실제 브라우저 실행 파일은 테스트와 맞추며 이 조합을 실제 확인했습니다. Codex는 이 PC의 **0.165.0-alpha.1.2**를 조회만 했고 업데이트하지 않았습니다. 본시험 설치 권한·OS·네트워크·문제·스킬 자동 인식은 아직 확정되지 않았습니다.

키나 계정 로그인 없이 동작합니다. `.env*`, 실제 `.npmrc`, 키 파일, 브라우저 프로필, 실행 로그·스크린샷·테스트 산출물·검증 클론은 커밋에서 제외합니다. `.codex/config.toml`은 개인 설정 없이 요청한 MCP 실행 설정만 공개합니다. 공개 샘플은 가상 데이터입니다.
