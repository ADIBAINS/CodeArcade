package com.codearcade.judge.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class ProcessUtil {
    private static final int STREAM_LIMIT_BYTES = 1024 * 1024;

    public static String readLimited(InputStream inputStream) {
        try (inputStream; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int total = 0;
            int read;

            while ((read = inputStream.read(buffer)) != -1) {
                int allowed = Math.min(read, STREAM_LIMIT_BYTES - total);
                if (allowed > 0) {
                    output.write(buffer, 0, allowed);
                    total += allowed;
                }
                if (total >= STREAM_LIMIT_BYTES) {
                    break;
                }
            }

            return output.toString(StandardCharsets.UTF_8);
        } catch (IOException error) {
            return error.getMessage();
        }
    }
}

