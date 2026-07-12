package com.codearcade.judge.service;

import java.util.ArrayList;
import java.util.List;

public class OutputComparator {
    public boolean compare(String actual, String expected) {
        return normalizeLines(actual).equals(normalizeLines(expected));
    }

    private List<String> normalizeLines(String value) {
        List<String> lines = new ArrayList<>();

        if (value == null) {
            return lines;
        }

        for (String line : value.split("\n", -1)) {
            lines.add(stripTrailing(line.replace("\r", "")));
        }

        while (!lines.isEmpty() && lines.get(lines.size() - 1).isEmpty()) {
            lines.remove(lines.size() - 1);
        }

        return lines;
    }

    private String stripTrailing(String value) {
        int end = value.length();
        while (end > 0 && Character.isWhitespace(value.charAt(end - 1))) {
            end--;
        }
        return value.substring(0, end);
    }
}

