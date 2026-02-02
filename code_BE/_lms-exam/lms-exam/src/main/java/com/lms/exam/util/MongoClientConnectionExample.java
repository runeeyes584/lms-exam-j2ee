package com.lms.exam.util;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.ServerApi;
import com.mongodb.ServerApiVersion;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class MongoClientConnectionExample {
    public static void main(String[] args) {
        String env = System.getenv("MONGODB_URI");
        if (env == null || env.isBlank()) {
            System.err.println("MONGODB_URI is not set. Set it to a valid connection string starting with mongodb:// or mongodb+srv://");
            System.err.println("Example (PowerShell): $env:MONGODB_URI = \"mongodb+srv://user:pass@host/db?retryWrites=true&w=majority\"");
            return;
        }

        String connectionString = env;

        ServerApi serverApi = ServerApi.builder()
                .version(ServerApiVersion.V1)
                .build();

        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(connectionString))
                .serverApi(serverApi)
                .build();

        try (MongoClient mongoClient = MongoClients.create(settings)) {
            try {
                MongoDatabase database = mongoClient.getDatabase("admin");
                database.runCommand(new Document("ping", 1));
                System.out.println("Pinged your deployment. Successfully connected to MongoDB!");
            } catch (MongoException e) {
                System.err.println("MongoException while pinging:");
                e.printStackTrace();
            }
        } catch (IllegalArgumentException ex) {
            System.err.println("Invalid connection string: " + ex.getMessage());
        }
    }
}
