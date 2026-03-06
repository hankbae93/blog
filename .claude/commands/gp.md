# Ship (git add, commit, push, merge to main)

모든 변경사항을 스테이징하고, 커밋한 뒤 main 브랜치에 머지하여 push한다.
Conductor에서 별도 브랜치로 작업한 경우를 위한 워크플로우.

---

## 절차

1. `git status`로 변경된 파일 목록 확인
2. `git diff --stat`로 변경 내용 확인
3. `git log --oneline -5`로 최근 커밋 메시지 스타일 확인
4. 변경 내용을 분석하여 커밋 메시지 작성:
   - prefix: `fix:`, `feat:`, `refactor:`, `docs:` 등
   - 한국어 설명 (간결하게)
5. 변경사항이 있으면 `git add .` → 커밋 (Co-Authored-By 포함)
6. 현재 브랜치가 main이 아닌 경우:
   - `git checkout main`
   - `git merge <작업브랜치> --no-edit`
7. `git push origin main`
8. 작업 브랜치 정리: `git branch -d <작업브랜치>`

## 인자

- `$ARGUMENTS`: 커밋 메시지 힌트 (선택). 제공되면 이를 참고하여 커밋 메시지 작성

## 주의사항

- `.env`, credentials 등 민감 파일이 포함되어 있으면 경고 후 제외
- 변경사항이 없으면 커밋 스킵하고 머지만 진행
- 머지 충돌 발생 시 사용자에게 알리고 중단
- main에서 직접 작업 중이면 머지 없이 바로 push
