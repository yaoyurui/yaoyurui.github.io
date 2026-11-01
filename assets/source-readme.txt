视觉质检版本对比与 RAG 规则检索助手｜个人项目源码

本包仅包含程序源码、模拟标准、模拟样本与测试。不包含真实密钥、加密密钥、运行数据库、用户导入文件或历史复核数据。
Python 3.10+，主程序只使用标准库。模型调用需要你自己的智谱标准 API Key。

启动方法
1. 安装 Python 3.10+。Windows 请保留 Python Launcher（py）。
2. 在解压目录执行：python app.py --open
   无密钥可使用本地对比、规则查询和人工复核。
3. 若需调用模型，Windows 双击“连接智谱免费模型并启动.cmd”，输入自己的密钥。
   使用 glm-4.7-flash，按平台当前免费政策、账号权限和限流规则执行。
4. 首次可勾选记住密钥，以 Windows 当前用户 DPAPI 加密保存在 data/credentials。
   通过“更换智谱密钥.cmd”“清除智谱密钥.cmd”管理，清除后仍需关闭已运行的后端。
5. 加载模拟演示，选择 SIM-025，查询条款并确认发送后生成解释。

工程说明
app.py：解析与确定性版本对比、HTTP服务。
standard_parser.py：TXT/MD/DOCX解析与分块。
quality_rules.py：适用范围过滤、关键词检索、SQLite复核记录。
rag_service.py：模型调用、业务错误归类、JSON/引用/逐字摘录校验。
quality-ui.js：规则查询与人工复核界面。
windows_credential_store.ps1：Windows当前用户加密存储。
标准资料均为模拟，不能作为真实生产判定依据。最终结论需人工确认。
网页在线体验展示预置模拟数据和一次真实调用快照，不会自动调用模型。

验证
python -m unittest discover -s tests -v
DPAPI真实测试需要已加载的Windows登录用户配置；受限进程中会明确跳过。
本包仅将CMD中的作者机器专用Python路径改为项目内.venv路径，找不到时仍回退 py -3；核心统计、RAG及复核逻辑未变。

数据流
只有页面点击生成并确认发送时，样本上下文与检索片段会发给模型服务。密钥仅在后端，不放在浏览器。
不支持PDF/OCR解析；当前检索为关键词方式，未引入向量数据库。
未完成真实用户效率对照，不代表生产级服务。
