@REM Maven Wrapper Script for Windows
@REM Automatically downloads Maven if not present

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "__MVNW_ARG0_NAME__=%~n0")
@SET @@MVNW_CMD=
@IF NOT "%MVNW_USERNAME%"=="" (
  @CALL :sub_find_jshell
)
@CALL :sub_main %*
@GOTO :EOF

:sub_main
@IF NOT "%JAVA_HOME%"=="" (
  @ECHO Using JAVA_HOME: %JAVA_HOME%
) ELSE (
  @SET JAVA_HOME=C:\Program Files\Java\jdk-21
)

@SET WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_PROPERTIES="%~dp0.mvn\wrapper\maven-wrapper.properties"

@SET DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar

@IF NOT EXIST %WRAPPER_JAR% (
  @ECHO Downloading Maven Wrapper JAR...
  @IF "%MVNW_REPOURL%"=="" (
    "%JAVA_HOME%\bin\java.exe" -cp "" -Dfile.encoding=UTF-8 ^
      org.apache.maven.wrapper.MavenWrapperMain ^
      %WRAPPER_PROPERTIES% %* 2>&1
  )
  @CALL :download_jar
)

@"%JAVA_HOME%\bin\java.exe" ^
  %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% ^
  -classpath %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%~dp0" ^
  org.apache.maven.wrapper.MavenWrapperMain ^
  %*

@GOTO :EOF

:download_jar
@ECHO Downloading: %DOWNLOAD_URL%
@powershell -Command "$p='SilentlyContinue'; $ProgressPreference=$p; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest '%DOWNLOAD_URL%' -OutFile '%~dp0.mvn\wrapper\maven-wrapper.jar'"
@GOTO :EOF
