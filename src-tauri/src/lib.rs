use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use warp::Filter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportFile {
    pub id: String,
    pub name: String,
    pub path: String,
    pub size: u64,
    pub extension: String,
    pub modified: u64,
    pub category: String,
    pub project_id: Option<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: String,
    pub description: String,
    pub created_at: u64,
    pub report_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppData {
    pub projects: Vec<Project>,
    pub reports: Vec<ReportFile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIConfig {
    pub provider: String,
    pub api_key: String,
    pub model: String,
    #[serde(default)]
    pub custom_api_url: String,
}

impl Default for AIConfig {
    fn default() -> Self {
        Self {
            provider: "openai".to_string(),
            api_key: String::new(),
            model: "gpt-3.5-turbo".to_string(),
            custom_api_url: String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub error: Option<String>,
}

fn get_app_data_dir() -> Result<PathBuf, String> {
    let home = dirs::data_local_dir().ok_or("Cannot find home directory")?;
    let data_dir = home.join("SecuArchive");
    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    }
    Ok(data_dir)
}

fn get_data_file_path() -> Result<PathBuf, String> {
    Ok(get_app_data_dir()?.join("data.json"))
}

fn get_config_file_path() -> Result<PathBuf, String> {
    Ok(get_app_data_dir()?.join("config.json"))
}

fn load_app_data() -> Result<AppData, String> {
    let path = get_data_file_path()?;
    if !path.exists() {
        return Ok(AppData {
            projects: vec![],
            reports: vec![],
        });
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

fn save_app_data(data: &AppData) -> Result<(), String> {
    let path = get_data_file_path()?;
    let content = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

fn load_ai_config() -> Result<AIConfig, String> {
    let path = get_config_file_path()?;
    if !path.exists() {
        return Ok(AIConfig::default());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: AIConfig = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config)
}

fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    format!("{:x}", timestamp)
}

fn detect_category(filename: &str) -> String {
    let lower = filename.to_lowercase();
    if lower.contains("渗透") || lower.contains("pentest") || lower.contains("web") || lower.contains("app") {
        "pentest".to_string()
    } else if lower.contains("审计") || lower.contains("audit") || lower.contains("代码") {
        "code-audit".to_string()
    } else if lower.contains("基线") || lower.contains("baseline") || lower.contains("配置") || lower.contains("扫描") {
        "baseline".to_string()
    } else if lower.contains("应急") || lower.contains("incident") || lower.contains("响应") {
        "emergency".to_string()
    } else {
        "other".to_string()
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_reports_dir() -> Result<String, String> {
    let home = dirs::data_local_dir().ok_or("Cannot find home directory")?;
    let reports_dir = home.join("SecuArchive").join("reports");
    if !reports_dir.exists() {
        fs::create_dir_all(&reports_dir).map_err(|e| e.to_string())?;
    }
    Ok(reports_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn get_projects_dir() -> Result<String, String> {
    let home = dirs::data_local_dir().ok_or("Cannot find home directory")?;
    let projects_dir = home.join("SecuArchive").join("projects");
    if !projects_dir.exists() {
        fs::create_dir_all(&projects_dir).map_err(|e| e.to_string())?;
    }
    Ok(projects_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn list_reports(dir: String) -> Result<Vec<ReportFile>, String> {
    let data = load_app_data()?;
    let reports_dir = PathBuf::from(&dir);
    
    if !reports_dir.exists() {
        return Ok(vec![]);
    }
    
    let mut reports = vec![];
    for entry in fs::read_dir(&reports_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            let metadata = entry.metadata().map_err(|e| e.to_string())?;
            let name = path.file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            let extension = path.extension()
                .map(|e| e.to_string_lossy().to_string())
                .unwrap_or_default();
            
            let category = detect_category(&name);
            let modified = metadata.modified()
                .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs())
                .unwrap_or(0);
            
            let existing_report = data.reports.iter().find(|r| r.path == path.to_string_lossy());
            
            reports.push(ReportFile {
                id: existing_report.map(|r| r.id.clone()).unwrap_or_else(generate_id),
                name,
                path: path.to_string_lossy().to_string(),
                size: metadata.len(),
                extension,
                modified,
                category: existing_report.map(|r| r.category.clone()).unwrap_or(category),
                project_id: existing_report.and_then(|r| r.project_id.clone()),
                tags: existing_report.map(|r| r.tags.clone()).unwrap_or_default(),
            });
        }
    }
    Ok(reports)
}

#[tauri::command]
fn get_projects() -> Result<Vec<Project>, String> {
    let data = load_app_data()?;
    Ok(data.projects)
}

#[tauri::command]
fn create_project(name: String, description: String) -> Result<Project, String> {
    let mut data = load_app_data()?;
    let projects_dir = get_projects_dir()?;
    let project_id = generate_id();
    
    let project_path = PathBuf::from(&projects_dir).join(&project_id);
    fs::create_dir_all(&project_path).map_err(|e| e.to_string())?;
    
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    let project = Project {
        id: project_id,
        name,
        path: project_path.to_string_lossy().to_string(),
        description,
        created_at: now,
        report_count: 0,
    };
    
    data.projects.push(project.clone());
    save_app_data(&data)?;
    
    Ok(project)
}

#[tauri::command]
fn delete_project(project_id: String) -> Result<(), String> {
    let mut data = load_app_data()?;
    
    if let Some(idx) = data.projects.iter().position(|p| p.id == project_id) {
        let project = data.projects.remove(idx);
        let project_path = PathBuf::from(&project.path);
        if project_path.exists() {
            fs::remove_dir_all(&project_path).map_err(|e| e.to_string())?;
        }
        
        for report in data.reports.iter_mut() {
            if report.project_id.as_ref() == Some(&project_id) {
                report.project_id = None;
            }
        }
        
        save_app_data(&data)?;
    }
    
    Ok(())
}

#[tauri::command]
fn import_report(src: String, project_id: Option<String>, category: String) -> Result<ReportFile, String> {
    let src_path = PathBuf::from(&src);
    let reports_dir = get_reports_dir()?;
    
    if !src_path.exists() {
        return Err("Source file does not exist".to_string());
    }
    
    let file_name = src_path.file_name()
        .ok_or("Invalid file name")?
        .to_string_lossy()
        .to_string();
    
    let dest_path = PathBuf::from(&reports_dir).join(&file_name);
    fs::copy(&src_path, &dest_path).map_err(|e| e.to_string())?;
    
    let metadata = fs::metadata(&dest_path).map_err(|e| e.to_string())?;
    let modified = metadata.modified()
        .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs())
        .unwrap_or(0);
    
    let extension = dest_path.extension()
        .map(|e| e.to_string_lossy().to_string())
        .unwrap_or_default();
    
    let report = ReportFile {
        id: generate_id(),
        name: file_name.clone(),
        path: dest_path.to_string_lossy().to_string(),
        size: metadata.len(),
        extension,
        modified,
        category: if category.is_empty() { detect_category(&file_name) } else { category },
        project_id,
        tags: vec![],
    };
    
    let mut data = load_app_data()?;
    data.reports.push(report.clone());
    save_app_data(&data)?;
    
    Ok(report)
}

#[tauri::command]
fn delete_report(path: String) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    if file_path.exists() {
        fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    }
    
    let mut data = load_app_data()?;
    data.reports.retain(|r| r.path != path);
    save_app_data(&data)?;
    
    Ok(())
}

#[tauri::command]
fn update_report_category(report_id: String, category: String) -> Result<(), String> {
    let mut data = load_app_data()?;
    if let Some(report) = data.reports.iter_mut().find(|r| r.id == report_id) {
        report.category = category;
        save_app_data(&data)?;
    }
    Ok(())
}

#[tauri::command]
fn update_report_project(report_id: String, project_id: Option<String>) -> Result<(), String> {
    let mut data = load_app_data()?;
    if let Some(report) = data.reports.iter_mut().find(|r| r.id == report_id) {
        report.project_id = project_id.clone();
        
        if let Some(ref pid) = project_id {
            if let Some(project) = data.projects.iter_mut().find(|p| p.id == *pid) {
                project.report_count = data.reports.iter().filter(|r| r.project_id.as_ref() == Some(pid)).count();
            }
        }
        
        save_app_data(&data)?;
    }
    Ok(())
}

#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    if content.len() > 50000 {
        Ok(content[..50000].to_string() + "\n\n... (内容过长，已截断)")
    } else {
        Ok(content)
    }
}

#[tauri::command]
fn get_file_info(path: String) -> Result<ReportFile, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    
    let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
    let name = file_path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    let extension = file_path.extension()
        .map(|e| e.to_string_lossy().to_string())
        .unwrap_or_default();
    let modified = metadata.modified()
        .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs())
        .unwrap_or(0);
    
    let data = load_app_data()?;
    let existing = data.reports.iter().find(|r| r.path == path);
    
    Ok(ReportFile {
        id: existing.map(|r| r.id.clone()).unwrap_or_else(generate_id),
        name: name.clone(),
        path,
        size: metadata.len(),
        extension,
        modified,
        category: existing.map(|r| r.category.clone()).unwrap_or_else(|| detect_category(&name)),
        project_id: existing.and_then(|r| r.project_id.clone()),
        tags: existing.map(|r| r.tags.clone()).unwrap_or_default(),
    })
}

#[tauri::command]
fn get_ai_config() -> Result<AIConfig, String> {
    load_ai_config()
}

#[tauri::command]
fn save_ai_config(config: AIConfig) -> Result<(), String> {
    let path = get_config_file_path()?;
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

fn get_api_endpoint(provider: &str, api_key: &str, custom_url: &str) -> (String, String) {
    match provider {
        "openai" => (
            "https://api.openai.com/v1/chat/completions".to_string(),
            format!("Bearer {}", api_key)
        ),
        "anthropic" => (
            "https://api.anthropic.com/v1/messages".to_string(),
            format!("Bearer {}", api_key)
        ),
        "azure" => {
            let endpoint = std::env::var("AZURE_OPENAI_ENDPOINT")
                .unwrap_or_else(|_| "https://your-resource.openai.azure.com".to_string());
            (format!("{}/openai/deployments/{}", endpoint, "gpt-4o"), "Bearer ".to_string())
        },
        "scnet" => (
            "https://api.siliconflow.cn/v1/chat/completions".to_string(),
            format!("Bearer {}", api_key)
        ),
        "moonshot" => (
            "https://api.moonshot.cn/v1/chat/completions".to_string(),
            format!("Bearer {}", api_key)
        ),
        "deepseek" => (
            "https://api.deepseek.com/v1/chat/completions".to_string(),
            format!("Bearer {}", api_key)
        ),
        "zhipu" => (
            "https://open.bigmodel.cn/api/paas/v4/chat/completions".to_string(),
            format!("Bearer {}", api_key)
        ),
        "local" => (
            format!("{}/v1/chat/completions", api_key.trim_end_matches('/')),
            "Bearer not-needed".to_string()
        ),
        "custom" => (
            format!("{}/v1/chat/completions", custom_url.trim_end_matches('/')),
            format!("Bearer {}", api_key)
        ),
        _ => (
            "https://api.openai.com/v1/chat/completions".to_string(),
            format!("Bearer {}", api_key)
        ),
    }
}

#[tauri::command]
async fn ai_chat(message: String, history: Vec<ChatMessage>) -> Result<AIResponse, String> {
    let config = load_ai_config()?;
    
    if config.api_key.is_empty() && config.provider != "local" {
        return Ok(AIResponse {
            content: String::new(),
            error: Some("请先在设置中配置 AI API Key".to_string()),
        });
    }
    
    let client = reqwest::Client::new();
    
    let mut messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: "你是一个安全服务报告分析助手，专门帮助用户理解渗透测试、代码审计、应急响应等安全报告的内容。请用中文回答问题。".to_string(),
        }
    ];
    messages.extend(history);
    messages.push(ChatMessage {
        role: "user".to_string(),
        content: message,
    });
    
    let (api_url, auth_header) = get_api_endpoint(
        &config.provider, 
        &config.api_key,
        &config.custom_api_url
    );
    
    let request_body = serde_json::json!({
        "model": config.model,
        "messages": messages,
        "temperature": 0.7,
    });
    
    let mut request = client
        .post(&api_url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json");
    
    if config.provider == "anthropic" {
        request = request.header("x-api-key", &config.api_key)
            .header("anthropic-version", "2023-06-01");
    }
    
    let response = request
        .json(&request_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if response.status().is_success() {
        let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        
        let content = if config.provider == "anthropic" {
            json["content"].as_array()
                .and_then(|arr| arr.first())
                .and_then(|c| c["text"].as_str())
                .map(|s| s.to_string())
        } else {
            json["choices"].as_array()
                .and_then(|arr| arr.first())
                .and_then(|choice| choice["message"]["content"].as_str())
                .map(|s| s.to_string())
        };
        
        if let Some(content) = content {
            Ok(AIResponse {
                content,
                error: None,
            })
        } else {
            Ok(AIResponse {
                content: String::new(),
                error: Some("无法解析 AI 响应".to_string()),
            })
        }
    } else {
        let error_text = response.text().await.unwrap_or_default();
        Ok(AIResponse {
            content: String::new(),
            error: Some(format!("API 错误: {}", error_text)),
        })
    }
}

#[tauri::command]
async fn ai_summarize(content: String) -> Result<String, String> {
    let config = load_ai_config()?;
    
    if config.api_key.is_empty() && config.provider != "local" {
        return Err("请先在设置中配置 AI API Key".to_string());
    }
    
    let client = reqwest::Client::new();
    
    let prompt = format!(r#"请分析以下安全服务报告内容，并提供：
1. 摘要（100字以内）
2. 发现的漏洞数量和严重程度
3. 建议的修复优先级

报告内容：
{}

请用中文输出。"#, content);
    
    let (api_url, auth_header) = get_api_endpoint(
        &config.provider, 
        &config.api_key,
        &config.custom_api_url
    );
    
    let request_body = serde_json::json!({
        "model": config.model,
        "messages": [
            {"role": "system", "content": "你是一个专业的安全服务报告分析助手。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.5,
        "max_tokens": 1000,
    });
    
    let mut request = client
        .post(&api_url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json");
    
    if config.provider == "anthropic" {
        request = request.header("x-api-key", &config.api_key)
            .header("anthropic-version", "2023-06-01");
    }
    
    let response = request
        .json(&request_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if response.status().is_success() {
        let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        
        let result_content = if config.provider == "anthropic" {
            json["content"].as_array()
                .and_then(|arr| arr.first())
                .and_then(|c| c["text"].as_str())
                .map(|s| s.to_string())
        } else {
            json["choices"].as_array()
                .and_then(|arr| arr.first())
                .and_then(|choice| choice["message"]["content"].as_str())
                .map(|s| s.to_string())
        };
        
        result_content.ok_or_else(|| "无法解析 AI 响应".to_string())
    } else {
        let error_text = response.text().await.unwrap_or_default();
        Err(format!("API 错误: {}", error_text))
    }
}

#[tauri::command]
async fn ai_classify(content: String) -> Result<String, String> {
    let config = load_ai_config()?;
    
    if config.api_key.is_empty() && config.provider != "local" {
        return Err("请先在设置中配置 AI API Key".to_string());
    }
    
    let client = reqwest::Client::new();
    
    let prompt = format!(r#"请分析以下安全报告内容，判断它属于哪种类型：

可选类型：
- pentest: 渗透测试报告
- code-audit: 代码审计报告  
- baseline: 基础环境测试/基线检查报告
- emergency: 应急响应报告
- other: 其他类型

报告内容（摘要）：
{}

请只输出类型名称，不要输出其他内容。"#, content);
    
    let (api_url, auth_header) = get_api_endpoint(
        &config.provider, 
        &config.api_key,
        &config.custom_api_url
    );
    
    let request_body = serde_json::json!({
        "model": config.model,
        "messages": [
            {"role": "system", "content": "你是一个安全报告分类助手，只输出分类名称。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 50,
    });
    
    let mut request = client
        .post(&api_url)
        .header("Authorization", auth_header)
        .header("Content-Type", "application/json");
    
    if config.provider == "anthropic" {
        request = request.header("x-api-key", &config.api_key)
            .header("anthropic-version", "2023-06-01");
    }
    
    let response = request
        .json(&request_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if response.status().is_success() {
        let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        
        let content = if config.provider == "anthropic" {
            json["content"].as_array()
                .and_then(|arr| arr.first())
                .and_then(|c| c["text"].as_str())
        } else {
            json["choices"].as_array()
                .and_then(|arr| arr.first())
                .and_then(|choice| choice["message"]["content"].as_str())
        };
        
        if let Some(content) = content {
            let category = content.trim().to_lowercase();
            if ["pentest", "code-audit", "baseline", "emergency", "other"].contains(&category.as_str()) {
                Ok(category)
            } else {
                Ok("other".to_string())
            }
        } else {
            Err("无法解析 AI 响应".to_string())
        }
    } else {
        let error_text = response.text().await.unwrap_or_default();
        Err(format!("API 错误: {}", error_text))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupData {
    pub version: String,
    pub created_at: u64,
    pub projects: Vec<Project>,
    pub reports: Vec<ReportFile>,
    pub ai_config: AIConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShareConfig {
    pub enabled: bool,
    pub port: u16,
    pub user_name: String,
    pub connection_id: Option<String>,
    pub connected_peers: Vec<PeerInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerInfo {
    pub id: String,
    pub name: String,
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransferProgress {
    pub file_id: String,
    pub file_name: String,
    pub total_bytes: u64,
    pub transferred_bytes: u64,
    pub status: String,
}

static SHARE_STATE: std::sync::Mutex<Option<ShareConfig>> = std::sync::Mutex::new(None);
static TRANSFER_PROGRESS: std::sync::Mutex<Vec<TransferProgress>> = std::sync::Mutex::new(Vec::new());

fn get_share_config_path() -> Result<PathBuf, String> {
    Ok(get_app_data_dir()?.join("share_config.json"))
}

fn load_share_config() -> Result<ShareConfig, String> {
    let path = get_share_config_path()?;
    if !path.exists() {
        return Ok(ShareConfig {
            enabled: false,
            port: 8765,
            user_name: "用户".to_string(),
            connection_id: None,
            connected_peers: vec![],
        });
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

fn save_share_config(config: &ShareConfig) -> Result<(), String> {
    let path = get_share_config_path()?;
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_backup() -> Result<String, String> {
    let data = load_app_data()?;
    let ai_config = load_ai_config()?;
    
    let backup = BackupData {
        version: "1.0".to_string(),
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        projects: data.projects,
        reports: data.reports,
        ai_config,
    };
    
    let json = serde_json::to_string_pretty(&backup).map_err(|e| e.to_string())?;
    
    let backup_dir = get_app_data_dir()?.join("backups");
    if !backup_dir.exists() {
        fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;
    }
    
    let filename = format!("secuarchive_backup_{}.json", chrono::Local::now().format("%Y%m%d_%H%M%S"));
    let backup_path = backup_dir.join(&filename);
    
    fs::write(&backup_path, json).map_err(|e| e.to_string())?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
fn import_backup(backup_path: String) -> Result<(), String> {
    let content = fs::read_to_string(&backup_path).map_err(|e| e.to_string())?;
    let backup: BackupData = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    let mut data = load_app_data()?;
    data.projects = backup.projects;
    data.reports = backup.reports;
    save_app_data(&data)?;
    
    save_ai_config(backup.ai_config)?;
    
    Ok(())
}

#[tauri::command]
fn get_backup_list() -> Result<Vec<BackupInfo>, String> {
    let backup_dir = get_app_data_dir()?.join("backups");
    if !backup_dir.exists() {
        return Ok(vec![]);
    }
    
    let mut backups = vec![];
    for entry in fs::read_dir(&backup_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() && path.extension().map(|e| e == "json").unwrap_or(false) {
            let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
            let modified = metadata.modified()
                .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs())
                .unwrap_or(0);
            
            let name = path.file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            
            backups.push(BackupInfo {
                name,
                path: path.to_string_lossy().to_string(),
                size: metadata.len(),
                created_at: modified,
            });
        }
    }
    
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(backups)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub created_at: u64,
}

#[tauri::command]
fn delete_backup(backup_path: String) -> Result<(), String> {
    let path = PathBuf::from(&backup_path);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_share_config() -> Result<ShareConfig, String> {
    load_share_config()
}

#[tauri::command]
fn update_share_config(config: ShareConfig) -> Result<(), String> {
    save_share_config(&config)?;
    let mut state = SHARE_STATE.lock().unwrap();
    *state = Some(config);
    Ok(())
}

#[tauri::command]
async fn start_share_server(port: u16, user_name: String) -> Result<String, String> {
    let server_addr: std::net::SocketAddr = format!("0.0.0.0:{}", port)
        .parse()
        .map_err(|e| format!("解析地址失败: {}", e))?;
    let connection_id = uuid::Uuid::new_v4().to_string();
    let connection_id_clone = connection_id.clone();
    let user_name_clone = user_name.clone();
    
    let routes = warp::path("api")
        .and(warp::post())
        .and(warp::body::json())
        .map(move |_request: serde_json::Value| {
            let response = serde_json::json!({
                "status": "ok",
                "message": "服务器已接收请求",
                "from": connection_id_clone,
                "user_name": user_name_clone,
            });
            warp::reply::json(&response)
        });
    
    tokio::spawn(async move {
        warp::serve(routes).run(server_addr).await;
    });
    
    let local_ip = local_ip_address::local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string());
    
    let server_url = format!("http://{}:{}", local_ip, port);
    
    let config = load_share_config().unwrap_or(ShareConfig {
        enabled: true,
        port,
        user_name,
        connection_id: Some(connection_id.clone()),
        connected_peers: vec![],
    });
    
    save_share_config(&ShareConfig {
        enabled: true,
        port,
        user_name: config.user_name,
        connection_id: Some(connection_id),
        connected_peers: vec![],
    })?;
    
    Ok(server_url)
}

#[tauri::command]
async fn connect_to_peer(address: String, user_name: String) -> Result<PeerInfo, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .post(&format!("{}/api", address))
        .json(&serde_json::json!({
            "action": "connect",
            "user_name": user_name
        }))
        .send()
        .await
        .map_err(|e| format!("连接失败: {}", e))?;
    
    if response.status().is_success() {
        let peer_id = uuid::Uuid::new_v4().to_string();
        Ok(PeerInfo {
            id: peer_id,
            name: user_name.clone(),
            address,
        })
    } else {
        Err("连接失败".to_string())
    }
}

#[tauri::command]
async fn send_file_to_peer(peer_address: String, file_path: String) -> Result<String, String> {
    let path = PathBuf::from(&file_path);
    if !path.exists() {
        return Err("文件不存在".to_string());
    }
    
    let file_name = path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    
    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
    let file_size = metadata.len();
    
    let file_data = fs::read(&path).map_err(|e| e.to_string())?;
    let encoded = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &file_data);
    
    let client = reqwest::Client::new();
    
    let response = client
        .post(&format!("{}/api/receive", peer_address))
        .json(&serde_json::json!({
            "file_name": file_name,
            "file_size": file_size,
            "data": encoded,
        }))
        .send()
        .await
        .map_err(|e| format!("发送失败: {}", e))?;
    
    if response.status().is_success() {
        Ok("文件发送成功".to_string())
    } else {
        Err("发送失败".to_string())
    }
}

#[tauri::command]
fn stop_share_server() -> Result<(), String> {
    let mut config = load_share_config().unwrap_or(ShareConfig {
        enabled: false,
        port: 8765,
        user_name: "用户".to_string(),
        connection_id: None,
        connected_peers: vec![],
    });
    config.enabled = false;
    config.connection_id = None;
    config.connected_peers = vec![];
    save_share_config(&config)?;
    
    let mut state = SHARE_STATE.lock().unwrap();
    *state = Some(config);
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_reports_dir,
            get_projects_dir,
            list_reports,
            get_projects,
            create_project,
            delete_project,
            import_report,
            delete_report,
            update_report_category,
            update_report_project,
            read_text_file,
            get_file_info,
            get_ai_config,
            save_ai_config,
            ai_chat,
            ai_summarize,
            ai_classify,
            export_backup,
            import_backup,
            get_backup_list,
            delete_backup,
            get_share_config,
            update_share_config,
            start_share_server,
            connect_to_peer,
            send_file_to_peer,
            stop_share_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
