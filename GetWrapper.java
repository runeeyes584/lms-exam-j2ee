
// Downloads maven-wrapper.jar from Maven Central
import java.io.*;
import java.net.*;

public class GetWrapper {
    public static void main(String[] args) throws Exception {
        String dest = args[0];
        String url = "https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar";
        System.out.println("Downloading: " + url);
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(20000);
        c.setReadTimeout(60000);
        c.setRequestProperty("User-Agent", "Java/21");
        try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(dest)) {
            byte[] b = new byte[4096];
            int n;
            while ((n = in.read(b)) != -1)
                out.write(b, 0, n);
        }
        System.out.println("Done: " + new File(dest).length() + " bytes");
    }
}
