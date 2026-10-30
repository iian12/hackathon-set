# Cofa 시험용 React 시작 템플릿

실제 문제를 받은 뒤 구현할 최소 React 화면과 재사용 가능한 도구입니다. 기본 **6.1 Sol**과 제공된 **Codex 버전**을 유지합니다.

## 설치·실행

Node **22.12 이상**이 필요합니다. 확인한 환경은 Node 24.14.0 / npm 11.9.0입니다. 시험 환경의 설치·네트워크 정책을 우선하세요.

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

각 명령의 성공을 확인한 뒤 다음 명령을 실행합니다. `check`는 **3000번 포트가 비어 있을 때** 실행하세요. `dev`는 `0.0.0.0:3000`에서 계속 실행됩니다. 미리보기에서 3000번 포트를 열거나 [로컬 앱](http://localhost:3000)을 확인하세요. 포트 충돌 시 다른 포트로 이동하지 않고 종료합니다.

Linux의 브라우저 시스템 라이브러리가 없고 설치가 허용된다면 `npx --no-install playwright install --with-deps chromium`을 사용하세요. 설치가 금지된 환경에서는 제공 브라우저를 확인하고 실행하지 못한 검사는 미검증으로 기록합니다. Codex 업데이트는 하지 않습니다.

## 시험에서 사용할 파일

| 위치 | 용도 |
| --- | --- |
| `src/starter/Starter.jsx` | 실제 답안 구현 시작점. 현재는 브라우저 입력·클릭 연결 확인 화면 |
| `src/App.jsx`, `src/style.css` | 앱 구성과 기본 스타일 |
| `src/shared/csv.js` | CSV 업로드·검증·다운로드 |
| `src/shared/table.js`, `DataTable.jsx` | 검색·필터·숫자 정렬과 표 |
| `src/shared/Feedback.jsx` | 오류·빈 결과 표시 |
| `src/shared/useLocalStorage.js` | 검증 가능한 브라우저 로컬 저장과 저장 실패 표시 |
| `tests/`, `scripts/` | 공통 도구와 서버·브라우저·MCP 검증 |
| `.codex/config.toml`, `config/` | MCP 설정과 다른 클라이언트용 설정 예시 |
| `.agents/skills/` | 웹 구현·브라우저 검증·CSV 처리 스킬 3개 |
| [시작 프롬프트](docs/START_PROMPT.ko.md) | 스킬 미인식 시에도 복사해서 시작 |
| [요구사항 기록](docs/REQUIREMENTS.md) | 실제 문제의 합격 조건과 검증 결과 정리 |

작업 순서: **요구사항 정리 → 최소 구현 → 실행 → 브라우저 검증 → 수정 → 최종 확인**.

판단 규칙·스키마·데이터는 문제 원문에서 정하고 별도 모듈로 분리하세요. `Starter.jsx`를 교체한 뒤에는 `tests/e2e/app.spec.js`와 `scripts/verify-mcp.mjs`의 연결 확인 조건도 실제 화면에 맞게 수정하세요. 기본 테스트 통과는 실제 문제의 합격을 의미하지 않습니다.

## 공통 도구 사용 조건

- `readCsvFile(file, { columns, validateRow })`: `columns`는 `{ key, label }` 목록, `validateRow(row)`는 오류 문자열 배열을 반환합니다. UTF-8 / 2MB / 10,000행을 기본 제한으로 두며 BOM·따옴표·쉼표·줄바꿈은 Papa Parse로 처리합니다. 기본 제한은 실제 요구사항에 맞춰 조정하세요.
- 필수 헤더·중복 헤더·행 너비·파일 인코딩 오류를 검증합니다. 업로드 성공 후에만 화면 데이터를 교체하세요. 파서는 추가 열을 허용하며 문제별 값 검증은 호출자가 전달합니다.
- `selectRows(rows, { query, filterKey, filter, sortKey, direction, numericKeys })`는 원본을 바꾸지 않고 검색·필터·정렬 결과를 반환합니다. 숫자 열은 `numericKeys`로 지정하세요.
- `DataTable`에는 안정적인 `id`를 가진 `rows`, `columns`, `sortKey`, `direction`, `onSort`를 전달합니다. `renderActions`로 행별 작업을 추가할 수 있습니다.
- `downloadCsv(rows, columns, filename)`는 전달한 행만 UTF-8 BOM CSV로 내보내며 수식 실행 문자를 이스케이프합니다. 원본 셀의 완전한 보존이 필요한 문제라면 이 정책을 재검토하세요.
- `useLocalStorage(key, initial, validate)`는 같은 브라우저·origin 안에서 유지됩니다. 서버 DB·다중 사용자 동기화가 필요하면 별도로 구현하세요. localhost, 미리보기 도메인, MCP 격리 세션은 저장소를 공유하지 않을 수 있습니다.

## Playwright MCP

저장소 루트에서 프로젝트 MCP 설정이 인식되는지 확인합니다. 프로젝트 신뢰 여부는 시험 환경 정책을 따르세요.

```sh
codex mcp list
codex mcp get playwright
```

`playwright`가 `enabled`여야 합니다. `Auth: Unsupported`는 인증 없는 stdio 서버의 표시입니다. 도구가 나타나지 않으면 에디터/Codex 세션을 다시 여세요.

프로젝트 설정이 인식되지 않으면 **시험 정책이 허용하는 경우** 사용자 범위에 등록하세요. 개인 경로 설정은 저장소에 커밋하지 않습니다.

PowerShell:

```powershell
$launcher = (Resolve-Path .\scripts\start-mcp.mjs).Path
codex mcp add playwright -- node $launcher
```

Linux/macOS:

```sh
codex mcp add playwright -- node "$PWD/scripts/start-mcp.mjs"
```

서버 실행 후 다른 터미널에서:

```sh
npm run verify:live
```

MCP는 구조 읽기·입력·클릭·스크린샷·콘솔 오류 확인을 실제 호출합니다. HTTP `/__server_identity`, MCP 화면, 미리보기의 **서버 확인** ID를 비교하면 같은 서버인지 확인할 수 있습니다. 재시작하면 ID가 바뀝니다. 정적 빌드 `preview`에는 개발 서버용 identity API가 없습니다.

`start-mcp.mjs`는 E2E와 같은 headless Chromium 실행 파일을 찾아 MCP에 전달합니다. MCP 0.0.83에서 입력·클릭은 스냅샷의 `ref=e...`를 `target`에 전달하며 스크린샷에는 `scale: 'css'`를 지정합니다. 실제 스키마는 `tools/list`를 확인하세요.

산출물은 `artifacts/mcp/`의 `result.json`, `transcript.json`, `tools.json`, `starter.png`입니다. 앱 콘솔의 오류 0개를 확인한 뒤 의도적인 `COFA_EXPECTED_CONSOLE_PROBE` 오류를 발생시켜 수집 기능도 확인합니다. 이 프로브는 앱 오류와 구분됩니다. SDK 검증 성공과 에디터 안의 도구 자동 로딩은 별도로 확인하세요.

## 검증·문제 해결

| 상황 | 명령 |
| --- | --- |
| 서버 종료 상태의 전체 검사 | `npm run check` |
| 서버 실행 상태의 브라우저·MCP 검사 | `npm run verify:live` |
| 공통 CSV·표 단위 검사 | `npm test` |
| 스킬 구조 검사 | `npm run test:skills` |
| 실패 보고서 | `npx --no-install playwright show-report` |
| 정적 빌드 | `npm run build` |

현재 기본 검사는 공통 도구 단위 테스트 **6개**, 시작 화면 브라우저 테스트 **2개**, MCP **7단계**, 포트 충돌 검사입니다. 실제 시험에서 문제별 테스트를 추가하세요.

- **포트 충돌**: Windows `Get-NetTCPConnection -State Listen -LocalPort 3000`, Linux `lsof -i :3000`으로 소유자를 확인합니다. 자신이 띄운 서버만 종료하고 재시작하세요.
- **서버 실행 중 `check` 실패**: 서버를 종료하거나 `verify:live`를 사용하세요. 자동 서버 검사는 다른 프로세스를 재사용하지 않습니다.
- **브라우저 없음 / spawn UNKNOWN**: `npm run browser:install` 후 제공 launcher를 사용하세요. full Chrome 경로를 강제하지 않습니다.
- **로컬 HTTP 접근 실패**: 시험 환경이 허용하는 터미널·네트워크 실행 경로를 확인하세요. 권한 오류와 앱 오류를 구분합니다.
- **MCP 인수 오류**: `artifacts/mcp/tools.json`의 실제 스키마와 최신 페이지 스냅샷을 확인하세요.
- **미리보기 불일치**: 실행 폴더·3000번 포트 전달·서버 ID를 확인하세요.

새 폴더 검증은 기존 서버를 종료한 뒤 `git clone` → `npm ci` → `npm run browser:install` → `npm run check` → `npm run dev` 순서로 수행하고, 다른 터미널에서 `npm run verify:live`를 실행하세요.

## 고정 버전과 공개 범위

| 패키지 | 버전 |
| --- | --- |
| React / React DOM | 19.3.1 |
| Vite / React 플러그인 | 8.3.5 / 6.1.2 |
| Playwright Test / MCP | 1.64.1 / 0.0.83 |
| MCP SDK / Papa Parse | 1.32.2 / 5.7.0 |

`package-lock.json`과 `npm ci`를 사용하세요. 시험 직전 `npm update`, `@latest` 재설치, Codex 업데이트는 하지 않습니다. `.node-version`은 확인한 런타임 기록이며 시험 환경의 변경을 강제하지 않습니다.

키 없이 실행됩니다. `.env*`, 실제 `.npmrc`, 키 파일, 개인 경로 설정, 브라우저 프로필·로그·스크린샷은 커밋하지 않습니다. `.codex/config.toml`에는 프로젝트 공통 MCP 실행 설정만 들어 있습니다.
