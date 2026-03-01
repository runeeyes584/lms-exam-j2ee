
// MavenDownloader.java - Downloads Maven 3.9.9 and sets up mvnw
import java.io.*;
import java.net.*;
import java.nio.file.*;
import java.util.zip.*;

public class MavenDownloader {
    public static void main(String[] args) throws Exception {
        String destDir = args.length > 0 ? args[0] : ".";
        String mavenUrl = "https://downloads.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip";
        File zipFile = new File(destDir, "maven.zip");
        File mavenDir = new File(destDir, "maven");

        System.out.println("Downloading Maven 3.9.9...");
        URL url = new URL(mavenUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setConnectTimeout(30000);
        conn.setReadTimeout(120000);

        try (InputStream in = conn.getInputStream();
                FileOutputStream out = new FileOutputStream(zipFile)) {
            byte[] buf = new byte[8192];
            int n;
            long total = 0;
            while ((n = in.read(buf)) != -1) {
                out.write(buf, 0, n);
                total += n;
                System.out.print("\rDownloaded: " + (total / 1024) + " KB");
            }
        }
        System.out.println("\nDownload complete! Extracting...");

        // Extract zip
        mavenDir.mkdirs();
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                File f = new File(mavenDir, entry.getName());
                if (entry.isDirectory()) {
                    f.mkdirs();
                } else {
                    f.getParentFile().mkdirs();
                    try (FileOutputStream fos = new FileOutputStream(f)) {
                        byte[] buf = new byte[8192];
                        int n;
                        while ((n = zis.read(buf)) != -1)
                            fos.write(buf, 0, n);
                    }
                }
            }
        }
        zipFile.delete();
        System.out.println("Maven ready at: " + mavenDir.getAbsolutePath() + "/apache-maven-3.9.9/bin/mvn.cmd");

        // Write a flag file
        Files.writeString(Path.of(destDir, "maven_ready.txt"), "OK");
    }
}
