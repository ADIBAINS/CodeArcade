import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const demoProblems = [
  {
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    statement: "Given two integers, print their sum.",
    inputFormat: "The function receives two integers a and b.",
    outputFormat: "Return the sum of a and b.",
    constraints: "-10^9 <= a, b <= 10^9",
    difficulty: "EASY" as const,
    testCases: [
      { input: "[2,3]", expected: "5", isHidden: false },
      { input: "[-4,10]", expected: "6", isHidden: true }
    ],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Maximum of Array",
    slug: "maximum-of-array",
    statement: "Given an array of integers, print the maximum element.",
    inputFormat: "The function receives an integer array nums.",
    outputFormat: "Return the maximum element in nums.",
    constraints: "1 <= n <= 100000, -10^9 <= ai <= 10^9",
    difficulty: "EASY" as const,
    testCases: [
      { input: "[[1,8,2,4,3]]", expected: "8", isHidden: false },
      { input: "[[-7,-2,-9]]", expected: "-2", isHidden: true }
    ],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Palindrome String",
    slug: "palindrome-string",
    statement: "Given a string, print YES if it is a palindrome, otherwise print NO.",
    inputFormat: "The function receives a lowercase string s.",
    outputFormat: "Return YES if s is a palindrome, otherwise return NO.",
    constraints: "1 <= |s| <= 100000",
    difficulty: "MEDIUM" as const,
    testCases: [
      { input: "[\"madam\"]", expected: "YES", isHidden: false },
      { input: "[\"code\"]", expected: "NO", isHidden: true }
    ],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "String"
  },
  {
    title: "Difference of Two Numbers", slug: "difference-of-two-numbers",
    statement: "Given two integers a and b, return a - b.",
    inputFormat: "The function receives two integers a and b.", outputFormat: "Return a - b.",
    constraints: "-10^9 <= a, b <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[10,4]", expected: "6", isHidden: false }, { input: "[-3,8]", expected: "-11", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Multiply Two Numbers", slug: "multiply-two-numbers",
    statement: "Given two integers, return their product.",
    inputFormat: "The function receives two integers a and b.", outputFormat: "Return a * b.",
    constraints: "-10^4 <= a, b <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[6,7]", expected: "42", isHidden: false }, { input: "[-5,9]", expected: "-45", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Even or Odd", slug: "even-or-odd",
    statement: "Determine whether an integer is even or odd.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return the string EVEN or ODD.",
    constraints: "-10^9 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[14]", expected: "EVEN", isHidden: false }, { input: "[-9]", expected: "ODD", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "String"
  },
  {
    title: "Reverse a String", slug: "reverse-a-string",
    statement: "Return the characters of a string in reverse order.",
    inputFormat: "The function receives a lowercase string s.", outputFormat: "Return the reversed string.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\"]", expected: "olleh", isHidden: false }, { input: "[\"arcade\"]", expected: "edacra", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "String"
  },
  {
    title: "Count Vowels", slug: "count-vowels",
    statement: "Count the vowels a, e, i, o, and u in a string.",
    inputFormat: "The function receives a lowercase string s.", outputFormat: "Return the number of vowels.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"leetcode\"]", expected: "4", isHidden: false }, { input: "[\"rhythm\"]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Sum of Array", slug: "sum-of-array",
    statement: "Return the sum of all elements in an integer array.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the array sum.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3,4,5]]", expected: "15", isHidden: false }, { input: "[[-5,2,-7]]", expected: "-10", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Count Positive Numbers", slug: "count-positive-numbers",
    statement: "Count how many elements in an array are strictly positive.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the positive-element count.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[-2,0,4,7,-1]]", expected: "2", isHidden: false }, { input: "[[1,2,3]]", expected: "3", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Second Largest Element", slug: "second-largest-element",
    statement: "Return the second largest distinct value in an array.",
    inputFormat: "The function receives an array with at least two distinct integers.", outputFormat: "Return the second largest value.",
    constraints: "2 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[3,8,1,8,5]]", expected: "5", isHidden: false }, { input: "[[-10,-3,-7]]", expected: "-7", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Factorial", slug: "factorial",
    statement: "Return n factorial, n!.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return n!.",
    constraints: "0 <= n <= 20", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[5]", expected: "120", isHidden: false }, { input: "[0]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "Linear Search", slug: "linear-search",
    statement: "Return the first index at which target occurs, or -1 if it is absent.",
    inputFormat: "The function receives an integer array nums and an integer target.", outputFormat: "Return the first matching index or -1.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[4,9,2,9],9]", expected: "1", isHidden: false }, { input: "[[1,3,5],2]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Binary Search", slug: "binary-search",
    statement: "Find target in a sorted array and return its index, or -1.",
    inputFormat: "The function receives a sorted integer array nums and target.", outputFormat: "Return the target index or -1.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[-5,-2,0,4,9],4]", expected: "3", isHidden: false }, { input: "[[1,3,5,7],6]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "GCD of Two Numbers", slug: "gcd-of-two-numbers",
    statement: "Return the greatest common divisor of two positive integers.",
    inputFormat: "The function receives positive integers a and b.", outputFormat: "Return gcd(a, b).",
    constraints: "1 <= a, b <= 10^9", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[48,18]", expected: "6", isHidden: false }, { input: "[101,10]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Valid Anagram", slug: "valid-anagram",
    statement: "Determine whether two lowercase strings contain the same characters with the same frequencies.",
    inputFormat: "The function receives strings s and t.", outputFormat: "Return YES if they are anagrams, otherwise return NO.",
    constraints: "1 <= |s|, |t| <= 100000", difficulty: "HARD" as const,
    testCases: [{ input: "[\"listen\",\"silent\"]", expected: "YES", isHidden: false }, { input: "[\"hello\",\"world\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Average of Array", slug: "average-of-array",
    statement: "Given an array of integers, return the integer average (floor of the exact average).",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the floored average.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[2,4,6]]", expected: "4", isHidden: false }, { input: "[[1,2]]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Minimum of Array", slug: "min-of-array",
    statement: "Given an array of integers, return the minimum element.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the minimum element in nums.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[5,2,9,1]]", expected: "1", isHidden: false }, { input: "[[-3,-1,-7]]", expected: "-7", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Count Even Numbers", slug: "count-even-numbers",
    statement: "Count how many elements in an array are even.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the even-element count.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3,4,5,6]]", expected: "3", isHidden: false }, { input: "[[1,3,5]]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "String Length", slug: "string-length",
    statement: "Return the number of characters in a string.",
    inputFormat: "The function receives a string s.", outputFormat: "Return the length of s.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\"]", expected: "5", isHidden: false }, { input: "[\"a\"]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Uppercase String", slug: "uppercase-string",
    statement: "Convert every character of a string to uppercase.",
    inputFormat: "The function receives a string s of letters.", outputFormat: "Return s in uppercase.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\"]", expected: "HELLO", isHidden: false }, { input: "[\"AbC\"]", expected: "ABC", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "String"
  },
  {
    title: "First Character", slug: "first-character",
    statement: "Return the first character of a string.",
    inputFormat: "The function receives a non-empty string s.", outputFormat: "Return the first character of s.",
    constraints: "1 <= |s| <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\"]", expected: "h", isHidden: false }, { input: "[\"world\"]", expected: "w", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "char"
  },
  {
    title: "Last Element", slug: "last-element",
    statement: "Return the last element of an array.",
    inputFormat: "The function receives a non-empty integer array nums.", outputFormat: "Return the last element.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3]]", expected: "3", isHidden: false }, { input: "[[9]]", expected: "9", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Square Number", slug: "square-number",
    statement: "Return the square of an integer.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return n * n.",
    constraints: "-10^5 <= n <= 10^5", difficulty: "EASY" as const,
    testCases: [{ input: "[5]", expected: "25", isHidden: false }, { input: "[12]", expected: "144", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "Cube Number", slug: "cube-number",
    statement: "Return the cube of an integer.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return n * n * n.",
    constraints: "-10^4 <= n <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[3]", expected: "27", isHidden: false }, { input: "[-2]", expected: "-8", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "Absolute Value", slug: "absolute-value",
    statement: "Return the absolute value of an integer.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return |n|.",
    constraints: "-10^9 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[-5]", expected: "5", isHidden: false }, { input: "[7]", expected: "7", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Is Positive", slug: "is-positive",
    statement: "Determine whether an integer is strictly positive.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return YES if n is positive, otherwise return NO.",
    constraints: "-10^9 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[5]", expected: "YES", isHidden: false }, { input: "[-3]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "String"
  },
  {
    title: "Sum 1 to N", slug: "sum-1-to-n",
    statement: "Return the sum of all integers from 1 to n.",
    inputFormat: "The function receives a positive integer n.", outputFormat: "Return 1 + 2 + ... + n.",
    constraints: "1 <= n <= 10^6", difficulty: "EASY" as const,
    testCases: [{ input: "[10]", expected: "55", isHidden: false }, { input: "[100]", expected: "5050", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "Product of Array", slug: "product-of-array",
    statement: "Return the product of all elements in an integer array.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the array product.",
    constraints: "1 <= nums.length <= 20, -10 <= ai <= 10", difficulty: "EASY" as const,
    testCases: [{ input: "[[2,3,4]]", expected: "24", isHidden: false }, { input: "[[5,5,5]]", expected: "125", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "long"
  },
  {
    title: "Maximum of Two", slug: "max-of-two",
    statement: "Return the larger of two integers.",
    inputFormat: "The function receives integers a and b.", outputFormat: "Return max(a, b).",
    constraints: "-10^9 <= a, b <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[3,7]", expected: "7", isHidden: false }, { input: "[-1,-5]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Minimum of Two", slug: "min-of-two",
    statement: "Return the smaller of two integers.",
    inputFormat: "The function receives integers a and b.", outputFormat: "Return min(a, b).",
    constraints: "-10^9 <= a, b <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[3,7]", expected: "3", isHidden: false }, { input: "[-1,-5]", expected: "-5", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Concatenate Strings", slug: "concatenate-strings",
    statement: "Join two strings together.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return a followed by b.",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\",\"world\"]", expected: "helloworld", isHidden: false }, { input: "[\"foo\",\"bar\"]", expected: "foobar", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Equal Strings", slug: "equal-strings",
    statement: "Determine whether two strings are exactly equal.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return YES if they are equal, otherwise return NO.",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"abc\",\"abc\"]", expected: "YES", isHidden: false }, { input: "[\"abc\",\"abd\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Repeat String", slug: "repeat-string",
    statement: "Repeat a string n times.",
    inputFormat: "The function receives a string s and a count n.", outputFormat: "Return s concatenated n times.",
    constraints: "1 <= |s| <= 100, 1 <= n <= 100", difficulty: "EASY" as const,
    testCases: [{ input: "[\"ab\",3]", expected: "ababab", isHidden: false }, { input: "[\"x\",4]", expected: "xxxx", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,int", returnType: "String"
  },
  {
    title: "Is Sorted Ascending", slug: "is-sorted-ascending",
    statement: "Determine whether an array is sorted in strictly increasing order.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return YES if strictly increasing, otherwise return NO.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3,4]]", expected: "YES", isHidden: false }, { input: "[[1,3,2]]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "String"
  },
  {
    title: "Contains Element", slug: "contains-element",
    statement: "Determine whether an array contains a target value.",
    inputFormat: "The function receives an integer array nums and a target.", outputFormat: "Return YES if target appears, otherwise return NO.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3],2]", expected: "YES", isHidden: false }, { input: "[[1,2,3],5]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "String"
  },
  {
    title: "Count Occurrences", slug: "count-occurrences",
    statement: "Count how many times a target value appears in an array.",
    inputFormat: "The function receives an integer array nums and a target.", outputFormat: "Return the occurrence count.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,2,3,2],2]", expected: "3", isHidden: false }, { input: "[[1,1,1],2]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Sum of Evens", slug: "sum-of-evens",
    statement: "Return the sum of all even elements in an array.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the sum of even elements.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3,4]]", expected: "6", isHidden: false }, { input: "[[1,3]]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Sum of Odds", slug: "sum-of-odds",
    statement: "Return the sum of all odd elements in an array.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the sum of odd elements.",
    constraints: "1 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[1,2,3,4]]", expected: "4", isHidden: false }, { input: "[[2,4]]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Number of Digits", slug: "number-of-digits",
    statement: "Count the digits of a non-negative integer.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return the digit count.",
    constraints: "0 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[12345]", expected: "5", isHidden: false }, { input: "[7]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Sum of Digits", slug: "sum-of-digits",
    statement: "Return the sum of the digits of a non-negative integer.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return the digit sum.",
    constraints: "0 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[123]", expected: "6", isHidden: false }, { input: "[1000]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Reverse Number", slug: "reverse-number",
    statement: "Reverse the digits of a non-negative integer.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return the reversed number.",
    constraints: "0 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[123]", expected: "321", isHidden: false }, { input: "[100]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Is Palindrome Number", slug: "is-palindrome-number",
    statement: "Determine whether a non-negative integer reads the same forwards and backwards.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return YES if it is a palindrome, otherwise return NO.",
    constraints: "0 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[121]", expected: "YES", isHidden: false }, { input: "[123]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "String"
  },
  {
    title: "Power Calculator", slug: "power-calculator",
    statement: "Raise a base to a non-negative exponent.",
    inputFormat: "The function receives a base a and an exponent b.", outputFormat: "Return a raised to b.",
    constraints: "0 <= a <= 100, 0 <= b <= 10", difficulty: "EASY" as const,
    testCases: [{ input: "[2,10]", expected: "1024", isHidden: false }, { input: "[3,3]", expected: "27", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "long"
  },
  {
    title: "LCM of Two Numbers", slug: "lcm-of-two",
    statement: "Return the least common multiple of two positive integers.",
    inputFormat: "The function receives positive integers a and b.", outputFormat: "Return lcm(a, b).",
    constraints: "1 <= a, b <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[4,6]", expected: "12", isHidden: false }, { input: "[7,5]", expected: "35", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Fahrenheit to Celsius", slug: "fahrenheit-to-celsius",
    statement: "Convert a Fahrenheit temperature to Celsius using integer arithmetic.",
    inputFormat: "The function receives an integer f in Fahrenheit.", outputFormat: "Return (f - 32) * 5 / 9 using integer division.",
    constraints: "-100 <= f <= 300", difficulty: "EASY" as const,
    testCases: [{ input: "[32]", expected: "0", isHidden: false }, { input: "[212]", expected: "100", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Minutes to Seconds", slug: "minutes-to-seconds",
    statement: "Convert minutes to seconds.",
    inputFormat: "The function receives a non-negative integer m.", outputFormat: "Return m * 60.",
    constraints: "0 <= m <= 10^6", difficulty: "EASY" as const,
    testCases: [{ input: "[5]", expected: "300", isHidden: false }, { input: "[1]", expected: "60", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Area of Rectangle", slug: "area-of-rectangle",
    statement: "Compute the area of a rectangle.",
    inputFormat: "The function receives width w and height h.", outputFormat: "Return w * h.",
    constraints: "1 <= w, h <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[4,5]", expected: "20", isHidden: false }, { input: "[3,3]", expected: "9", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Perimeter of Rectangle", slug: "perimeter-of-rectangle",
    statement: "Compute the perimeter of a rectangle.",
    inputFormat: "The function receives width w and height h.", outputFormat: "Return 2 * (w + h).",
    constraints: "1 <= w, h <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[4,5]", expected: "18", isHidden: false }, { input: "[3,3]", expected: "12", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "Sum of Squares", slug: "sum-of-squares",
    statement: "Return the sum of the squares of two integers.",
    inputFormat: "The function receives integers a and b.", outputFormat: "Return a*a + b*b.",
    constraints: "-10^4 <= a, b <= 10^4", difficulty: "EASY" as const,
    testCases: [{ input: "[3,4]", expected: "25", isHidden: false }, { input: "[1,2]", expected: "5", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "long"
  },
  {
    title: "ASCII Value", slug: "ascii-value",
    statement: "Return the ASCII code of a character.",
    inputFormat: "The function receives a character c.", outputFormat: "Return the ASCII code of c.",
    constraints: "c is a printable ASCII character", difficulty: "EASY" as const,
    testCases: [{ input: "[\"A\"]", expected: "65", isHidden: false }, { input: "[\"a\"]", expected: "97", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "char", returnType: "int"
  },
  {
    title: "Vowel or Consonant", slug: "vowel-or-consonant",
    statement: "Determine whether a lowercase letter is a vowel or a consonant.",
    inputFormat: "The function receives a lowercase letter c.", outputFormat: "Return VOWEL or CONSONANT.",
    constraints: "c is a lowercase letter", difficulty: "EASY" as const,
    testCases: [{ input: "[\"a\"]", expected: "VOWEL", isHidden: false }, { input: "[\"b\"]", expected: "CONSONANT", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "char", returnType: "String"
  },
  {
    title: "To Lowercase Char", slug: "to-lowercase-char",
    statement: "Convert an uppercase letter to lowercase.",
    inputFormat: "The function receives an uppercase letter c.", outputFormat: "Return the lowercase form of c.",
    constraints: "c is an uppercase letter", difficulty: "EASY" as const,
    testCases: [{ input: "[\"A\"]", expected: "a", isHidden: false }, { input: "[\"Z\"]", expected: "z", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "char", returnType: "char"
  },
  {
    title: "Longer String Length", slug: "longer-string-length",
    statement: "Return the length of the longer of two strings.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return max(|a|, |b|).",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\",\"hi\"]", expected: "5", isHidden: false }, { input: "[\"a\",\"abcd\"]", expected: "4", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "int"
  },
  {
    title: "Combined String Length", slug: "combined-string-length",
    statement: "Return the combined length of two strings.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return |a| + |b|.",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\",\"hi\"]", expected: "7", isHidden: false }, { input: "[\"ab\",\"cd\"]", expected: "4", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "int"
  },
  {
    title: "Ends With Check", slug: "ends-with-check",
    statement: "Determine whether a string ends with a given suffix.",
    inputFormat: "The function receives a string s and a suffix.", outputFormat: "Return YES if s ends with the suffix, otherwise return NO.",
    constraints: "1 <= |s|, |suffix| <= 1000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\",\"lo\"]", expected: "YES", isHidden: false }, { input: "[\"hello\",\"he\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Starts With Check", slug: "starts-with-check",
    statement: "Determine whether a string starts with a given prefix.",
    inputFormat: "The function receives a string s and a prefix.", outputFormat: "Return YES if s starts with the prefix, otherwise return NO.",
    constraints: "1 <= |s|, |prefix| <= 1000", difficulty: "EASY" as const,
    testCases: [{ input: "[\"hello\",\"he\"]", expected: "YES", isHidden: false }, { input: "[\"hello\",\"lo\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Second Element", slug: "second-element",
    statement: "Return the second element of an array.",
    inputFormat: "The function receives an integer array nums with at least two elements.", outputFormat: "Return the second element.",
    constraints: "2 <= nums.length <= 100000", difficulty: "EASY" as const,
    testCases: [{ input: "[[5,10,15]]", expected: "10", isHidden: false }, { input: "[[1,2]]", expected: "2", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Double Number", slug: "double-number",
    statement: "Return twice the value of an integer.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return 2 * n.",
    constraints: "-10^9 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[21]", expected: "42", isHidden: false }, { input: "[-3]", expected: "-6", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Halve Number", slug: "halve-number",
    statement: "Halve a non-negative integer using integer division.",
    inputFormat: "The function receives a non-negative integer n.", outputFormat: "Return n / 2 rounded down.",
    constraints: "0 <= n <= 10^9", difficulty: "EASY" as const,
    testCases: [{ input: "[7]", expected: "3", isHidden: false }, { input: "[100]", expected: "50", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Pair Sum Exists", slug: "pair-sum-exists",
    statement: "Determine whether any two distinct elements of an array sum to a target.",
    inputFormat: "The function receives an integer array nums and a target.", outputFormat: "Return YES if such a pair exists, otherwise return NO.",
    constraints: "2 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,3,4],5]", expected: "YES", isHidden: false }, { input: "[[1,2,3],7]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "String"
  },
  {
    title: "Best Stock Profit", slug: "best-stock-profit",
    statement: "Given daily stock prices, return the maximum profit from one buy and one later sell.",
    inputFormat: "The function receives an integer array prices.", outputFormat: "Return the maximum profit, or 0 if none is possible.",
    constraints: "1 <= prices.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[7,1,5,3,6,4]]", expected: "5", isHidden: false }, { input: "[[7,6,4,3,1]]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Maximum Subarray", slug: "maximum-subarray",
    statement: "Return the largest sum of any contiguous subarray.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the maximum subarray sum.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[-2,1,-3,4,-1,2,1,-5,4]]", expected: "6", isHidden: false }, { input: "[[-1,-2,-3]]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Contains Duplicate", slug: "contains-duplicate",
    statement: "Determine whether an array contains any duplicate value.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return YES if a duplicate exists, otherwise return NO.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,3,1]]", expected: "YES", isHidden: false }, { input: "[[1,2,3,4]]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "String"
  },
  {
    title: "Missing Number", slug: "missing-number",
    statement: "An array holds n distinct numbers from 0 to n with one missing. Return the missing number.",
    inputFormat: "The function receives an integer array nums of length n.", outputFormat: "Return the missing number in 0..n.",
    constraints: "1 <= n <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[3,0,1]]", expected: "2", isHidden: false }, { input: "[[0,1]]", expected: "2", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Find Duplicate Number", slug: "find-duplicate-number",
    statement: "An array of n + 1 integers from 1 to n contains exactly one duplicate. Return it.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the duplicated number.",
    constraints: "2 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,3,4,2,2]]", expected: "2", isHidden: false }, { input: "[[3,1,3,4,2]]", expected: "3", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Rotate String Check", slug: "rotate-string-check",
    statement: "Determine whether one string is a rotation of another.",
    inputFormat: "The function receives strings s and goal of equal length.", outputFormat: "Return YES if s can be rotated into goal, otherwise return NO.",
    constraints: "1 <= |s| <= 1000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"abcde\",\"cdeab\"]", expected: "YES", isHidden: false }, { input: "[\"abcde\",\"abced\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Valid Parentheses", slug: "valid-parentheses",
    statement: "Determine whether a bracket string of (), [], {} is properly closed and nested.",
    inputFormat: "The function receives a bracket string s.", outputFormat: "Return YES if valid, otherwise return NO.",
    constraints: "1 <= |s| <= 10000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"()[]{}\"]", expected: "YES", isHidden: false }, { input: "[\"(]\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "String"
  },
  {
    title: "Common Prefix Length", slug: "common-prefix-length",
    statement: "Return the length of the longest common prefix of two strings.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return the common prefix length.",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"flower\",\"flow\"]", expected: "4", isHidden: false }, { input: "[\"dog\",\"cat\"]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "int"
  },
  {
    title: "Ransom Note Possible", slug: "ransom-note-possible",
    statement: "Determine whether a note can be built from the letters of a magazine string.",
    inputFormat: "The function receives strings note and magazine.", outputFormat: "Return YES if the note can be constructed, otherwise return NO.",
    constraints: "1 <= |note|, |magazine| <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"aa\",\"aab\"]", expected: "YES", isHidden: false }, { input: "[\"aa\",\"ab\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Majority Element", slug: "majority-element",
    statement: "Return the element appearing more than half the time. It always exists.",
    inputFormat: "The function receives an integer array nums with a majority element.", outputFormat: "Return the majority element.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[3,2,3]]", expected: "3", isHidden: false }, { input: "[[2,2,1,1,1,2,2]]", expected: "2", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Peak Element Index", slug: "peak-element-index",
    statement: "Return the index of a peak element, which is greater than its neighbours. Exactly one peak exists.",
    inputFormat: "The function receives an integer array nums with one peak.", outputFormat: "Return the peak index.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,3,1]]", expected: "2", isHidden: false }, { input: "[[1,3,2]]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Search Insert Position", slug: "search-insert-position",
    statement: "In a sorted array of distinct integers, return the index of a target or where it should be inserted.",
    inputFormat: "The function receives a sorted array nums and a target.", outputFormat: "Return the index or insert position.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,3,5,6],5]", expected: "2", isHidden: false }, { input: "[[1,3,5,6],2]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Climbing Stairs", slug: "climbing-stairs",
    statement: "Count distinct ways to climb n steps taking 1 or 2 steps at a time.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return the number of ways.",
    constraints: "1 <= n <= 45", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[3]", expected: "3", isHidden: false }, { input: "[5]", expected: "8", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "Fibonacci Number", slug: "fibonacci-number",
    statement: "Return the n-th Fibonacci number with F(0) = 0 and F(1) = 1.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return F(n).",
    constraints: "0 <= n <= 50", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[10]", expected: "55", isHidden: false }, { input: "[0]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "long"
  },
  {
    title: "House Robber", slug: "house-robber",
    statement: "Return the maximum money robbable from houses in a row without robbing adjacent ones.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the maximum amount.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,3,1]]", expected: "4", isHidden: false }, { input: "[[2,7,9,3,1]]", expected: "12", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Longest Increasing Run", slug: "longest-increasing-run",
    statement: "Return the length of the longest contiguous strictly increasing run.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the longest run length.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,2,3,4]]", expected: "3", isHidden: false }, { input: "[[5,4,3]]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Distinct Count", slug: "distinct-count",
    statement: "Count the distinct values in an array.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return the distinct value count.",
    constraints: "1 <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,2,3]]", expected: "3", isHidden: false }, { input: "[[5,5,5]]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Intersection Count", slug: "intersection-count",
    statement: "Count the distinct values appearing in both arrays.",
    inputFormat: "The function receives integer arrays a and b.", outputFormat: "Return the common distinct value count.",
    constraints: "1 <= |a|, |b| <= 10000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,2,3],[2,3,4]]", expected: "2", isHidden: false }, { input: "[[1],[2]]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int[]", returnType: "int"
  },
  {
    title: "Union Count", slug: "union-count",
    statement: "Count the distinct values appearing in either array.",
    inputFormat: "The function receives integer arrays a and b.", outputFormat: "Return the union distinct value count.",
    constraints: "1 <= |a|, |b| <= 10000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2],[2,3]]", expected: "3", isHidden: false }, { input: "[[5],[5]]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int[]", returnType: "int"
  },
  {
    title: "Kth Smallest Sorted", slug: "kth-smallest-sorted",
    statement: "Return the k-th smallest element of a sorted array, with k starting at 1.",
    inputFormat: "The function receives a sorted array nums and k.", outputFormat: "Return the k-th smallest element.",
    constraints: "1 <= k <= nums.length <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[[1,2,3,4,5],3]", expected: "3", isHidden: false }, { input: "[[10,20,30],1]", expected: "10", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Longest Palindrome Length", slug: "longest-palindrome-length",
    statement: "Return the length of the longest palindromic substring.",
    inputFormat: "The function receives a string s.", outputFormat: "Return the longest palindromic substring length.",
    constraints: "1 <= |s| <= 1000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"babad\"]", expected: "3", isHidden: false }, { input: "[\"cbbd\"]", expected: "2", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Longest Unique Substring", slug: "longest-unique-substring",
    statement: "Return the length of the longest substring without repeating characters.",
    inputFormat: "The function receives a string s.", outputFormat: "Return the longest valid substring length.",
    constraints: "1 <= |s| <= 100000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"abcabcbb\"]", expected: "3", isHidden: false }, { input: "[\"bbbbb\"]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "String to Integer", slug: "string-to-integer",
    statement: "Parse a simple signed integer string with no spaces or extra characters.",
    inputFormat: "The function receives a string like -17 or 42.", outputFormat: "Return the parsed integer.",
    constraints: "-10^9 <= value <= 10^9", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"42\"]", expected: "42", isHidden: false }, { input: "[\"-17\"]", expected: "-17", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Add Large Numbers", slug: "add-large-numbers",
    statement: "Add two non-negative integers given as decimal strings too large for 64-bit types.",
    inputFormat: "The function receives numeric strings a and b.", outputFormat: "Return their sum as a string.",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"123\",\"456\"]", expected: "579", isHidden: false }, { input: "[\"999\",\"1\"]", expected: "1000", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  },
  {
    title: "Roman to Integer", slug: "roman-to-integer",
    statement: "Convert a valid Roman numeral to an integer.",
    inputFormat: "The function receives a Roman numeral string.", outputFormat: "Return its integer value.",
    constraints: "1 <= value <= 3999", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"III\"]", expected: "3", isHidden: false }, { input: "[\"MCMXCIV\"]", expected: "1994", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Excel Column Number", slug: "excel-column-number",
    statement: "Convert an Excel column title to its column number.",
    inputFormat: "The function receives an uppercase column title.", outputFormat: "Return the column number.",
    constraints: "1 <= |title| <= 7", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[\"A\"]", expected: "1", isHidden: false }, { input: "[\"AB\"]", expected: "28", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String", returnType: "int"
  },
  {
    title: "Happy Number", slug: "happy-number",
    statement: "Determine whether repeatedly replacing a number by the sum of squares of its digits reaches 1.",
    inputFormat: "The function receives a positive integer n.", outputFormat: "Return YES if n is happy, otherwise return NO.",
    constraints: "1 <= n <= 10^9", difficulty: "MEDIUM" as const,
    testCases: [{ input: "[19]", expected: "YES", isHidden: false }, { input: "[2]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "String"
  },
  {
    title: "Trapping Rain Water", slug: "trapping-rain-water",
    statement: "Given bar heights, compute how much rain water is trapped after raining.",
    inputFormat: "The function receives an integer array height.", outputFormat: "Return the trapped water volume.",
    constraints: "1 <= height.length <= 100000, 0 <= hi <= 10^4", difficulty: "HARD" as const,
    testCases: [{ input: "[[0,1,0,2,1,0,1,3,2,1,2,1]]", expected: "6", isHidden: false }, { input: "[[4,2,0,3,2,5]]", expected: "9", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Largest Rectangle Histogram", slug: "largest-rectangle-histogram",
    statement: "Given histogram bar heights, return the area of the largest rectangle.",
    inputFormat: "The function receives an integer array heights.", outputFormat: "Return the largest rectangle area.",
    constraints: "1 <= heights.length <= 100000", difficulty: "HARD" as const,
    testCases: [{ input: "[[2,1,5,6,2,3]]", expected: "10", isHidden: false }, { input: "[[2,4]]", expected: "4", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "int"
  },
  {
    title: "Word Break Possible", slug: "word-break-possible",
    statement: "Determine whether a string can be segmented into words from a dictionary.",
    inputFormat: "The function receives a string s and a string array dict.", outputFormat: "Return YES if s can be segmented, otherwise return NO.",
    constraints: "1 <= |s| <= 300, 1 <= dict.length <= 1000", difficulty: "HARD" as const,
    testCases: [{ input: "[\"leetcode\",[\"leet\",\"code\"]]", expected: "YES", isHidden: false }, { input: "[\"cats\",[\"cat\"]]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String[]", returnType: "String"
  },
  {
    title: "Combination Sum Count", slug: "combination-sum-count",
    statement: "Count ordered combinations of distinct numbers that sum to a target. Different orders count separately.",
    inputFormat: "The function receives distinct integers nums and a target.", outputFormat: "Return the combination count.",
    constraints: "1 <= nums.length <= 200, 1 <= target <= 1000", difficulty: "HARD" as const,
    testCases: [{ input: "[[1,2,3],4]", expected: "7", isHidden: false }, { input: "[[2],3]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Edit Distance", slug: "edit-distance",
    statement: "Return the minimum insertions, deletions, and replacements to convert one string into another.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return the edit distance.",
    constraints: "0 <= |a|, |b| <= 500", difficulty: "HARD" as const,
    testCases: [{ input: "[\"horse\",\"ros\"]", expected: "3", isHidden: false }, { input: "[\"intention\",\"execution\"]", expected: "5", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "int"
  },
  {
    title: "Longest Common Subsequence", slug: "longest-common-subsequence",
    statement: "Return the length of the longest common subsequence of two strings.",
    inputFormat: "The function receives strings a and b.", outputFormat: "Return the LCS length.",
    constraints: "1 <= |a|, |b| <= 1000", difficulty: "HARD" as const,
    testCases: [{ input: "[\"abcde\",\"ace\"]", expected: "3", isHidden: false }, { input: "[\"abc\",\"def\"]", expected: "0", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "int"
  },
  {
    title: "Coin Change Min Coins", slug: "coin-change-min-coins",
    statement: "Return the fewest coins needed to make an amount, or -1 if impossible.",
    inputFormat: "The function receives coin denominations and an amount.", outputFormat: "Return the minimum coin count or -1.",
    constraints: "1 <= coins.length <= 12, 0 <= amount <= 10^4", difficulty: "HARD" as const,
    testCases: [{ input: "[[1,2,5],11]", expected: "3", isHidden: false }, { input: "[[2],3]", expected: "-1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[],int", returnType: "int"
  },
  {
    title: "Partition Equal Subset Possible", slug: "partition-equal-subset-possible",
    statement: "Determine whether an array can be split into two subsets with equal sums.",
    inputFormat: "The function receives an integer array nums.", outputFormat: "Return YES if an equal partition exists, otherwise return NO.",
    constraints: "1 <= nums.length <= 200, 1 <= ai <= 100", difficulty: "HARD" as const,
    testCases: [{ input: "[[1,5,11,5]]", expected: "YES", isHidden: false }, { input: "[[1,2,3,5]]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int[]", returnType: "String"
  },
  {
    title: "Unique Paths", slug: "unique-paths",
    statement: "Count paths from the top-left to the bottom-right of an m by n grid moving only down or right.",
    inputFormat: "The function receives integers m and n.", outputFormat: "Return the path count.",
    constraints: "1 <= m, n <= 100", difficulty: "HARD" as const,
    testCases: [{ input: "[3,7]", expected: "28", isHidden: false }, { input: "[3,2]", expected: "3", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int,int", returnType: "int"
  },
  {
    title: "N Queens Count", slug: "n-queens-count",
    statement: "Count distinct ways to place n queens on an n by n board with no attacks.",
    inputFormat: "The function receives an integer n.", outputFormat: "Return the solution count.",
    constraints: "1 <= n <= 9", difficulty: "HARD" as const,
    testCases: [{ input: "[4]", expected: "2", isHidden: false }, { input: "[1]", expected: "1", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "int", returnType: "int"
  },
  {
    title: "Valid Sudoku", slug: "valid-sudoku",
    statement: "Determine whether a partially filled 9 by 9 Sudoku board is valid. Empty cells are dots.",
    inputFormat: "The function receives a string array of 9 rows.", outputFormat: "Return YES if the board is valid, otherwise return NO.",
    constraints: "9 rows of 9 characters each", difficulty: "HARD" as const,
    testCases: [{ input: "[\"53..7....\",\"6..195...\",\".98....6.\",\"8...6...3\",\"4..8.3..1\",\"7...2...6\",\".6....28.\",\"...419..5\",\"....8..79\"]", expected: "YES", isHidden: false }, { input: "[\"55..7....\",\"6..195...\",\".98....6.\",\"8...6...3\",\"4..8.3..1\",\"7...2...6\",\".6....28.\",\"...419..5\",\"....8..79\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String[]", returnType: "String"
  },
  {
    title: "Wildcard Match Possible", slug: "wildcard-match-possible",
    statement: "Match a string against a pattern where ? matches any single character and * matches any sequence.",
    inputFormat: "The function receives a string s and a pattern p.", outputFormat: "Return YES if the whole string matches, otherwise return NO.",
    constraints: "1 <= |s|, |p| <= 2000", difficulty: "HARD" as const,
    testCases: [{ input: "[\"aa\",\"a*\"]", expected: "YES", isHidden: false }, { input: "[\"cb\",\"?a\"]", expected: "NO", isHidden: true }],
    judgeMode: "FUNCTION", functionName: "solve", argumentTypes: "String,String", returnType: "String"
  }
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@codearcade.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (process.env.NODE_ENV === "production" && adminPassword === "admin123") {
    throw new Error("ADMIN_PASSWORD must be set to a strong value before seeding production");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      name: "CodeArcade Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN"
    }
  });

  for (const problem of demoProblems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        title: problem.title,
        statement: problem.statement,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        difficulty: problem.difficulty,
        judgeMode: problem.judgeMode as any,
        functionName: problem.functionName,
        argumentTypes: problem.argumentTypes,
        returnType: problem.returnType
      },
      create: {
        title: problem.title,
        slug: problem.slug,
        statement: problem.statement,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        difficulty: problem.difficulty,
        judgeMode: problem.judgeMode as any,
        functionName: problem.functionName,
        argumentTypes: problem.argumentTypes,
        returnType: problem.returnType,
        testCases: {
          create: problem.testCases
        }
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
