#!/bin/bash

# 数据文件路径
DB_FILE="./serve/db.json"
# 备份目录
BACKUP_DIR="./serve/backups"

# 如果备份目录不存在就创建
mkdir -p "$BACKUP_DIR"

# 时间戳（替换冒号，防止文件名不合法）
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# 生成备份文件路径
BACKUP_FILE="$BACKUP_DIR/db-$TIMESTAMP.json"

# 复制文件
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_FILE"
    echo "✅ 数据已备份到 $BACKUP_FILE"
else
    echo "❌ 备份失败：找不到 $DB_FILE"
fi
