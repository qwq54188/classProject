# 街声 - 城市微更新公众提案平台

## 项目简介

市民拍照上传公共设施问题，其他人附议投票，管理者更新处理状态，形成"问题发现→民意聚集→解决公示"的闭环。

## 技术栈

- 后端：Spring Boot 3.2.5 + MyBatis-Plus 3.5.7 + MySQL 8.0
- 前端：纯 HTML + CSS + JavaScript
- 无加密/无安全框架：密码明文存储，无 Spring Security

## 数据库准备

1. 安装并启动 MySQL
2. 执行初始化脚本：`src/main/resources/schema.sql`

```bash
mysql -u root -p < src/main/resources/schema.sql
```

或者手动在 MySQL 中执行该脚本。

3. 修改数据库配置（如需）：编辑 `src/main/resources/application.properties`

```properties
spring.datasource.username=root
spring.datasource.password=123456
```

## 运行项目

```bash
mvn spring-boot:run
```

或者先打包后运行：

```bash
mvn package
java -jar target/street-sound-1.0.0.jar
```

## 访问地址

- 首页：http://localhost:8080/

## 测试账号

可以通过注册页面创建账号，或手动插入管理员账号：

```sql
INSERT INTO user (username, password, role) VALUES ('admin', 'admin123', 1);
```

## 功能说明

### 市民功能
- 注册/登录
- 发布提案（填写标题、描述、分类、地点名称、图片路径
- 查看提案列表
- 按分类/状态筛选提案
- 附议提案
- 查看提案详情
- 查看热点地图

### 管理员功能
- 查看所有提案列表
- 标记提案为已解决
- 填写处理结果描述和图片

## 数据库表结构

### user 表
- id: 主键
- username: 用户名
- password: 密码
- role: 角色（0=市民，1=管理员）
- create_time: 创建时间

### proposal 表
- id: 主键
- title: 标题
- description: 描述
- photo_url: 图片路径
- category: 分类
- location_name: 地点名称
- status: 状态（0=待处理，1=已解决）
- result_desc: 处理结果描述
- result_photo_url: 处理后图片路径
- creator_id: 创建者ID
- create_time: 创建时间

### vote 表
- id: 主键
- proposal_id: 提案ID
- user_id: 用户ID
- create_time: 创建时间
- 联合唯一索引：(proposal_id, user_id)
