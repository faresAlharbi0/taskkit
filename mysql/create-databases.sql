CREATE DATABASE IF NOT EXISTS taskkit;

USE taskkit;

CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(255) PRIMARY KEY NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificationBoxes (
    username VARCHAR(255) UNIQUE NOT NULL,
    id int PRIMARY KEY AUTO_INCREMENT,
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS workspaces (
    uuid CHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    wsname VARCHAR(255) NOT NULL,
    wsdescription VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS grouplist (
    uuid CHAR(36) UNIQUE NOT NULL,
    id int PRIMARY KEY AUTO_INCREMENT,
    FOREIGN KEY (uuid) REFERENCES workspaces(uuid)
); 
CREATE TABLE IF NOT EXISTS groupmembers (
    listid int NOT NULL,
    id int PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    userStatus BOOLEAN,
    FOREIGN KEY (listid) REFERENCES grouplist(id),
    FOREIGN KEY (username) REFERENCES users(username)
); 

CREATE TABLE IF NOT EXISTS inviteWorkspaces (
    uuid CHAR(36) NOT NULL,
    id int PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    FOREIGN KEY (uuid) REFERENCES workspaces(uuid),
    FOREIGN KEY (username) REFERENCES users(username),
    UNIQUE KEY unique_invite_key (username, uuid)
);

CREATE TABLE IF NOT EXISTS notificationMessages (
    id int PRIMARY KEY AUTO_INCREMENT,
    boxID int NOT NULL,
    isDialouge BOOLEAN NOT NULL,
    response BOOLEAN,
    readStatus BOOLEAN DEFAULT 0,
    actionTarget CHAR(36),
    _message VARCHAR(255) NOT NULL,
    FOREIGN KEY (BoxID) REFERENCES notificationBoxes(id),
    FOREIGN KEY (actionTarget) REFERENCES workspaces(uuid),
    UNIQUE KEY unique_invite_key (boxID, actionTarget)
);

CREATE TABLE IF NOT EXISTS articleLists (
    uuid CHAR(36) UNIQUE,
    id int PRIMARY KEY AUTO_INCREMENT,
    FOREIGN KEY (uuid) REFERENCES workspaces(uuid)
);

CREATE TABLE IF NOT EXISTS articles (
    article_uuid CHAR(36) PRIMARY KEY,
    listid int,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    FOREIGN KEY (listid) REFERENCES articleLists(id)
);

CREATE TABLE IF NOT EXISTS groupChat (
    uuid CHAR(36) UNIQUE,
    id int PRIMARY KEY AUTO_INCREMENT,
    FOREIGN KEY (uuid) REFERENCES workspaces(uuid)
);

CREATE TABLE IF NOT EXISTS chatMessages (
    chatID int,
    username VARCHAR(255) NOT NULL,
    _message VARCHAR(255),
    FOREIGN KEY (chatID) REFERENCES groupChat(id),
    FOREIGN KEY (username) REFERENCES users(username),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taskListsBoxes (
    uuid CHAR(36) UNIQUE,
    id int PRIMARY KEY AUTO_INCREMENT,
    FOREIGN KEY (uuid) REFERENCES workspaces(uuid)
);

CREATE TABLE IF NOT EXISTS taskLists (
    taskListuuid CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    boxID int,
    FOREIGN KEY (boxID) REFERENCES taskListsBoxes(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    task_uuid CHAR(36) PRIMARY KEY,
    taskListuuid CHAR(36),
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    FOREIGN KEY (taskListuuid) REFERENCES taskLists(taskListuuid),
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS assignments (
    id int PRIMARY KEY AUTO_INCREMENT,
    task_uuid CHAR(36) NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    content VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY (task_uuid) REFERENCES tasks(task_uuid),
    FOREIGN KEY (username) REFERENCES users(username),
    UNIQUE KEY unique_assignment_key (username, task_uuid)
);
