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
    uuid CHAR(36) UNIQUE NOT NULL,
    id int PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    FOREIGN KEY (uuid) REFERENCES workspaces(uuid),
    FOREIGN KEY (username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS notificationMessages (
    id int PRIMARY KEY AUTO_INCREMENT,
    boxID int NOT NULL,
    isDialouge BOOLEAN NOT NULL,
    response BOOLEAN,
    readStatus BOOLEAN DEFAULT 0,
    actionTarget CHAR(36) UNIQUE,
    _message VARCHAR(255) NOT NULL,
    FOREIGN KEY (BoxID) REFERENCES notificationBoxes(id),
    FOREIGN KEY (actionTarget) REFERENCES workspaces(uuid)
);