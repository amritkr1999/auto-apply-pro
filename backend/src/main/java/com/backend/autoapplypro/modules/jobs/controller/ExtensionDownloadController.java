package com.backend.autoapplypro.modules.jobs.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/v1/public/extension")
@Slf4j
public class ExtensionDownloadController {

    @GetMapping("/download")
    public ResponseEntity<ByteArrayResource> downloadExtensionZip() {
        log.info("Request received for downloading Chrome Extension ZIP package...");

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ZipOutputStream zos = new ZipOutputStream(baos)) {

                // Path to extension directory
                File baseDir = new File("extension");
                if (baseDir.exists() && baseDir.isDirectory()) {
                    addFolderToZip(baseDir, baseDir, zos);
                } else {
                    // Dynamic fallback zip entries if extension directory is missing
                    addZipFileEntry(zos, "easynaukri-extension/manifest.json", getManifestContent());
                    addZipFileEntry(zos, "easynaukri-extension/background.js", getBackgroundJsContent());
                    addZipFileEntry(zos, "easynaukri-extension/popup.html", getPopupHtmlContent());
                    addZipFileEntry(zos, "easynaukri-extension/README.txt", getReadmeContent());
                }
            }

            byte[] zipBytes = baos.toByteArray();
            ByteArrayResource resource = new ByteArrayResource(zipBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"easynaukri-extension.zip\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(zipBytes.length)
                    .body(resource);

        } catch (Exception e) {
            log.error("Error creating extension ZIP file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private void addFolderToZip(File rootDir, File sourceFile, ZipOutputStream zos) throws IOException {
        if (sourceFile.isDirectory()) {
            File[] files = sourceFile.listFiles();
            if (files != null) {
                for (File file : files) {
                    addFolderToZip(rootDir, file, zos);
                }
            }
        } else {
            String entryName = "easynaukri-extension/" + rootDir.toURI().relativize(sourceFile.toURI()).getPath();
            ZipEntry zipEntry = new ZipEntry(entryName);
            zos.putNextEntry(zipEntry);
            try (FileInputStream fis = new FileInputStream(sourceFile)) {
                byte[] buffer = new byte[1024];
                int length;
                while ((length = fis.read(buffer)) >= 0) {
                    zos.write(buffer, 0, length);
                }
            }
            zos.closeEntry();
        }
    }

    private void addZipFileEntry(ZipOutputStream zos, String entryName, String content) throws IOException {
        ZipEntry zipEntry = new ZipEntry(entryName);
        zos.putNextEntry(zipEntry);
        zos.write(content.getBytes(StandardCharsets.UTF_8));
        zos.closeEntry();
    }

    private String getManifestContent() {
        return """
                {
                  "manifest_version": 3,
                  "name": "EasyNaukri Harvester & Auto Apply Node",
                  "version": "1.0.0",
                  "description": "Background job harvester and auto-apply extension node for EasyNaukri (Auto Apply Pro).",
                  "permissions": ["alarms", "storage"],
                  "host_permissions": ["*://*.naukri.com/*", "*://*.linkedin.com/*", "*://*.indeed.com/*", "*://*.instahyre.com/*", "*://*.wellfound.com/*"],
                  "background": { "service_worker": "background.js" },
                  "action": { "default_popup": "popup.html" }
                }
                """;
    }

    private String getBackgroundJsContent() {
        return """
                const BACKEND_URL = 'http://localhost:8060';
                chrome.runtime.onInstalled.addListener(() => {
                  console.log('EasyNaukri Harvester Extension installed.');
                  chrome.alarms.create('harvesterTaskAlarm', { periodInMinutes: 20 });
                });
                """;
    }

    private String getPopupHtmlContent() {
        return """
                <!DOCTYPE html>
                <html>
                <head><title>EasyNaukri</title></head>
                <body style="font-family: sans-serif; padding: 15px; width: 220px; background: #0f172a; color: white;">
                  <h3>⚡ EasyNaukri Node</h3>
                  <p style="font-size: 12px; color: #94a3b8;">Background Harvester Active.</p>
                </body>
                </html>
                """;
    }

    private String getReadmeContent() {
        return """
                =================================================
                EasyNaukri Chrome Extension Setup Instructions
                =================================================
                1. Extract this ZIP file to your Documents folder.
                2. Open Google Chrome and navigate to: chrome://extensions
                3. Enable "Developer mode" toggle in the top-right corner.
                4. Click "Load unpacked" and select this unzipped folder.
                5. EasyNaukri will pin to your extension toolbar!
                """;
    }
}
