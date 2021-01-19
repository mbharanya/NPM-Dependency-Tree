DROP DATABASE IF EXISTS npm_packages;
CREATE DATABASE npm_packages;
\c npm_packages
CREATE TABLE package(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(255) NOT NULL
);