#!/bin/bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Starting Intelligent Task Allocator Backend with JDK 17..."
mvn spring-boot:run
