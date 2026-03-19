#!/bin/bash
# init-project.sh — AI Solution Demo プロジェクト初期化スクリプト
# Usage: ./init-project.sh <project-name> [base-dir]
#
# 標準ドキュメント構成（番号付き8カテゴリ）でディレクトリを生成する。

set -euo pipefail

PROJECT_NAME="${1:?Error: プロジェクト名を指定してください。Usage: ./init-project.sh <project-name> [base-dir]}"
BASE_DIR="${2:-.}"
PROJECT_DIR="${BASE_DIR}/${PROJECT_NAME}"

if [ -d "$PROJECT_DIR" ]; then
  echo "Warning: ディレクトリ ${PROJECT_DIR} は既に存在します。"
  read -p "上書きしますか？ (y/N): " confirm
  if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "中止しました。"
    exit 1
  fi
fi

echo "=== プロジェクト '${PROJECT_NAME}' を初期化します ==="

# 標準ドキュメント構成を作成
mkdir -p "${PROJECT_DIR}/docs/01-requirements"
mkdir -p "${PROJECT_DIR}/docs/02-design/wireframes"
mkdir -p "${PROJECT_DIR}/docs/03-project"
mkdir -p "${PROJECT_DIR}/docs/04-testing"
mkdir -p "${PROJECT_DIR}/docs/05-deliverables/estimates"
mkdir -p "${PROJECT_DIR}/docs/05-deliverables/proposal"
mkdir -p "${PROJECT_DIR}/docs/06-demo/videos"
mkdir -p "${PROJECT_DIR}/docs/07-plans"
mkdir -p "${PROJECT_DIR}/docs/08-qa-videos"
mkdir -p "${PROJECT_DIR}/docs/reviews"

# ソースコード・テスト
mkdir -p "${PROJECT_DIR}/src"
mkdir -p "${PROJECT_DIR}/tests/e2e"
mkdir -p "${PROJECT_DIR}/tests/unit"
mkdir -p "${PROJECT_DIR}/tests/api"
mkdir -p "${PROJECT_DIR}/tests/page-objects"
mkdir -p "${PROJECT_DIR}/tests/manifests"
mkdir -p "${PROJECT_DIR}/tests/helpers"

# WORKFLOW.md を生成
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="${SKILL_DIR}/assets/workflow-state-template.md"

TODAY="$(date '+%Y-%m-%d')"

if [ -f "$TEMPLATE" ]; then
  SAFE_NAME=$(printf '%s\n' "$PROJECT_NAME" | sed 's|[/&\\]|\\&|g')
  sed "s|{{project_name}}|${SAFE_NAME}|g; s|{{date}}|${TODAY}|g" \
    "$TEMPLATE" | \
    awk -v today="$TODAY" '
      /\| 0 \| .* \| pending \|/ && !done {
        sub(/\| pending \|/, "| completed |"); sub(/\| - \|/, "| " today " |"); done=1
      }
      { print }
    ' > "${PROJECT_DIR}/WORKFLOW.md"
else
  echo "Warning: テンプレート ${TEMPLATE} が見つかりません。空のWORKFLOW.mdを作成します。"
  cat > "${PROJECT_DIR}/WORKFLOW.md" << EOF
# Workflow State: ${PROJECT_NAME}

**開始日**: $(date '+%Y-%m-%d')

| Phase | Name | Status | Updated |
|-------|------|--------|---------|
| 0 | 初期化 | completed | $(date '+%Y-%m-%d') |
| 1 | 要件定義 | pending | - |
| 2 | 設計 | pending | - |
| 3 | 整合性レビュー | pending | - |
| 4 | UI/UX設計 | pending | - |
| 5 | 実装 | pending | - |
| 6 | テスト+レビュー | pending | - |
| 7 | デモ動画 | pending | - |
| 8 | マニュアル | pending | - |
| 9 | 提案書 | pending | - |
EOF
fi

# memo.md の存在確認
if [ -f "${PROJECT_DIR}/docs/memo.md" ]; then
  echo "✓ docs/memo.md を検出しました。"
else
  echo "→ docs/memo.md にヒアリングメモを配置してください。"
fi

echo ""
echo "=== 初期化完了 ==="
echo "ディレクトリ構造:"
find "${PROJECT_DIR}" -type d | sort | sed "s|${BASE_DIR}/||" | head -30
echo ""
echo "ドキュメント配置ルール:"
echo "  docs/01-requirements/  → requirements.md"
echo "  docs/02-design/        → design.md, api-reference.md, db-schema.md, screen-flow.md"
echo "  docs/02-design/wireframes/ → ワイヤーフレーム"
echo "  docs/03-project/       → project-plan.md, risk-register.md, branching-strategy.md"
echo "  docs/05-deliverables/  → 見積書, 提案書, テンプレート"
echo ""
echo "次のステップ:"
echo "  1. ${PROJECT_DIR}/docs/memo.md にヒアリングメモを配置"
echo "  2. /ai-solution-demo phase 1 で要件定義を開始"
