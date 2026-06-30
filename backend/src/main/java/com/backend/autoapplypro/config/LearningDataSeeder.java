package com.backend.autoapplypro.config;

import com.backend.autoapplypro.modules.learning.model.*;
import com.backend.autoapplypro.modules.learning.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class LearningDataSeeder implements CommandLineRunner {

    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final PracticeQuestionRepository questionRepository;
    private final DailyTipRepository dailyTipRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting Learning Space database seeding...");

        if (topicRepository.count() > 0) {
            log.info("Learning space data already seeded. Skipping seeder.");
            return;
        }

        // 1. Seed Topics & Subtopics
        Topic java = createTopic("Java", "Core Java Programming, JVM internals, and advanced multithreading.", "java");
        createSubtopic("Java Concurrency", "Threads, executors, locks, and concurrent collections.", java);
        Topic jvm = createSubtopic("JVM Internals", "Memory management, garbage collection, and class loading.", java);

        Topic python = createTopic("Python", "Dynamic language concepts, decorators, memory model, and asyncio.", "python");
        createSubtopic("Python Decorators & Generators", "Metaprogramming, function wrappers, and iterator protocols.", python);
        Topic pythonAsync = createSubtopic("Asyncio & Concurrency", "Asynchronous loop programming and coroutines.", python);

        Topic spring = createTopic("Spring", "Dependency injection, AOP, Boot configuration, Security, and JPA.", "spring");
        createSubtopic("Dependency Injection & Beans", "Inversion of control, scopes, and context initialization.", spring);
        Topic springSecurity = createSubtopic("Spring Security & JWT", "Filter chains, authentication providers, and token validation.", spring);

        Topic js = createTopic("JavaScript", "Modern ECMAScript, event loop, closures, promises, and prototyping.", "javascript");
        createSubtopic("Event Loop & Async", "Microtasks, macrotasks, and rendering call stacks.", js);
        createSubtopic("Closures & Prototypes", "Lexical scoping, lexical environment, and prototype chains.", js);

        Topic react = createTopic("React", "Hooks, virtual DOM, reconciliation, state management, and SSR.", "react");
        Topic reactHooks = createSubtopic("React Hooks & Context", "Functional components lifecycle, custom hooks, and shared states.", react);
        createSubtopic("Concurrent Rendering & Fiber", "Reconciliation engine, transitions, and suspense.", react);

        Topic angular = createTopic("Angular", "Modules, dependency injection, RxJS, state, and change detection.", "angular");
        createSubtopic("RxJS & Reactive Forms", "Observables, subjects, and custom form validation.", angular);

        Topic cpp = createTopic("C++", "Memory allocation, pointers, STL, templates, and concurrency.", "cpp");
        createSubtopic("Smart Pointers & Memory", "Unique, shared, and weak references with RAII.", cpp);

        Topic flutter = createTopic("Flutter", "Widget tree, state management, custom animation, and native bridges.", "flutter");
        createSubtopic("State Management (Provider/Riverpod)", "Reactive UI bindings and decoupled states.", flutter);

        Topic go = createTopic("Go", "Goroutines, channels, interfaces, structural typing, and compilation.", "go");
        Topic goRoutines = createSubtopic("Goroutines & Channels", "CSP concurrency, select blocks, and worker pools.", go);

        Topic kafka = createTopic("Kafka", "Event streaming, partitions, consumers, producer configs, and offsets.", "kafka");
        Topic kafkaPartitions = createSubtopic("Partitions & Consumers", "Scalability, consumer groups, and offset management.", kafka);

        Topic redis = createTopic("Redis", "In-memory caching, data structures, expirations, persistence, and pub/sub.", "redis");
        Topic redisCache = createSubtopic("Caching & Data Types", "String, Hash, List, Set, Sorted Set, and TTL policies.", redis);

        log.info("Topics and Subtopics seeded successfully.");

        // 2. Seed Reference Resources (Documentation & Videos)
        seedResources(jvm, redisCache, reactHooks, goRoutines, kafkaPartitions);

        // 3. Seed Practice Questions
        seedQuestions(jvm, redisCache, reactHooks, goRoutines, kafkaPartitions);

        // 4. Seed Daily Tips
        seedDailyTips();

        log.info("Learning Space database seeding completed successfully.");
    }

    private Topic createTopic(String name, String description, String icon) {
        Topic topic = Topic.builder()
                .name(name)
                .description(description)
                .icon(icon)
                .build();
        return topicRepository.save(topic);
    }

    private Topic createSubtopic(String name, String description, Topic parent) {
        Topic subtopic = Topic.builder()
                .name(name)
                .description(description)
                .parentTopic(parent)
                .build();
        return topicRepository.save(subtopic);
    }

    private void seedResources(Topic jvm, Topic redisCache, Topic reactHooks, Topic goRoutines, Topic kafkaPartitions) {
        // JVM resources
        resourceRepository.save(Resource.builder()
                .title("Oracle Java Virtual Machine Specification")
                .url("https://docs.oracle.com/javase/specs/jvms/se21/html/index.html")
                .type(ResourceType.DOCUMENTATION)
                .description("The official specification document outlining JVM architecture, instruction sets, and class file structures.")
                .topic(jvm)
                .build());

        resourceRepository.save(Resource.builder()
                .title("JVM Garbage Collection Deep Dive")
                .url("https://www.youtube.com/watch?v=2Tz8A-f5x4s")
                .type(ResourceType.VIDEO)
                .description("An educational video explaining G1, ZGC, and generational garbage collection mechanics.")
                .topic(jvm)
                .build());

        // Redis resources
        resourceRepository.save(Resource.builder()
                .title("Redis Commands & Data Types Reference")
                .url("https://redis.io/docs/latest/develop/data-types/")
                .type(ResourceType.DOCUMENTATION)
                .description("Official guide to Redis data structures, including Hashes, Sorted Sets, HyperLogLogs, and Bitmaps.")
                .topic(redisCache)
                .build());

        // React resources
        resourceRepository.save(Resource.builder()
                .title("React Hooks Official Reference Guide")
                .url("https://react.dev/reference/react/hooks")
                .type(ResourceType.DOCUMENTATION)
                .description("Official React documentation on built-in hooks: useState, useEffect, useContext, useMemo, and useCallback.")
                .topic(reactHooks)
                .build());

        // Go resources
        resourceRepository.save(Resource.builder()
                .title("Effective Go - Concurrency")
                .url("https://go.dev/doc/effective_go#concurrency")
                .type(ResourceType.DOCUMENTATION)
                .description("Guiding advice on sharing memory by communicating, goroutine allocations, and channel patterns.")
                .topic(goRoutines)
                .build());

        // Kafka resources
        resourceRepository.save(Resource.builder()
                .title("Apache Kafka Introduction Guide")
                .url("https://kafka.apache.org/documentation/#intro")
                .type(ResourceType.DOCUMENTATION)
                .description("Official guide on Kafka architecture, event streaming principles, and partition distribution.")
                .topic(kafkaPartitions)
                .build());
    }

    private void seedQuestions(Topic jvm, Topic redisCache, Topic reactHooks, Topic goRoutines, Topic kafkaPartitions) {
        // JVM Question
        questionRepository.save(PracticeQuestion.builder()
                .title("JVM Memory Areas")
                .content("In which JVM memory area are Java local variables stored during thread execution?")
                .difficulty(DifficultyLevel.EASY)
                .choices(Arrays.asList(
                        "Metaspace (Permanent Generation)",
                        "Java Heap Memory",
                        "JVM Stack (Thread Stack)",
                        "Method Area"
                ))
                .correctAnswer("JVM Stack (Thread Stack)")
                .explanation("Local variables declared inside methods are allocated dynamically in the thread's JVM Stack frame. Heap memory is reserved for objects, whereas Metaspace holds class metadata.")
                .topic(jvm)
                .build());

        questionRepository.save(PracticeQuestion.builder()
                .title("Garbage Collection Selection")
                .content("Which JVM garbage collector is designed to minimize pause times to microseconds (sub-millisecond) for large heaps, at the cost of slight application throughput?")
                .difficulty(DifficultyLevel.HARD)
                .choices(Arrays.asList(
                        "Serial Collector",
                        "Parallel GC",
                        "G1 (Garbage-First) GC",
                        "ZGC (Z Garbage Collector)"
                ))
                .correctAnswer("ZGC (Z Garbage Collector)")
                .explanation("ZGC is a scalable, low-latency garbage collector capable of handling heaps ranging from megabytes to multiple terabytes with pause times that do not exceed 1 millisecond.")
                .topic(jvm)
                .build());

        // Redis Question
        questionRepository.save(PracticeQuestion.builder()
                .title("Redis Sorted Set Time Complexity")
                .content("What is the time complexity of adding a new element to a Redis Sorted Set (ZADD)?")
                .difficulty(DifficultyLevel.MEDIUM)
                .choices(Arrays.asList(
                        "O(1)",
                        "O(log(N))",
                        "O(N)",
                        "O(N * log(N))"
                ))
                .correctAnswer("O(log(N))")
                .explanation("Redis Sorted Sets are implemented using a dual data structure: a Skip List combined with a Hash Table. Finding and updating the position of a element in the sorted hierarchy requires O(log(N)) time.")
                .topic(redisCache)
                .build());

        // React Question
        questionRepository.save(PracticeQuestion.builder()
                .title("React useEffect Hook Cleanup")
                .content("When does the cleanup function returned inside a React useEffect callback execute?")
                .difficulty(DifficultyLevel.MEDIUM)
                .choices(Arrays.asList(
                        "Only when the component is unmounted from the DOM.",
                        "Immediately after the initial render commits to the screen.",
                        "Right before the component is re-rendered due to dependency changes, and when it unmounts.",
                        "After every state change inside the parent component, regardless of dependencies."
                ))
                .correctAnswer("Right before the component is re-rendered due to dependency changes, and when it unmounts.")
                .explanation("React cleans up effects from the previous execution before running the effect next time, as well as when the component unmounts to prevent memory leaks.")
                .topic(reactHooks)
                .build());

        // Go Question
        questionRepository.save(PracticeQuestion.builder()
                .title("Go Channel Blocking Behavior")
                .content("What happens when you send a value to an unbuffered channel in Go when there is no active goroutine ready to read from it?")
                .difficulty(DifficultyLevel.MEDIUM)
                .choices(Arrays.asList(
                        "The value is silently discarded and the code continues.",
                        "The sending goroutine blocks until a receiver reads the value.",
                        "The channel buffers the value automatically up to a size of 1.",
                        "A runtime panic is thrown immediately."
                ))
                .correctAnswer("The sending goroutine blocks until a receiver reads the value.")
                .explanation("Unbuffered channels are synchronous. Sends and receives block until both parties are ready, which enables safe, lock-free synchronization between goroutines.")
                .topic(goRoutines)
                .build());

        // Kafka Question
        questionRepository.save(PracticeQuestion.builder()
                .title("Kafka Partition Scaling")
                .content("What is the maximum number of active consumers in a single consumer group that can read from a Kafka topic with 4 partitions?")
                .difficulty(DifficultyLevel.EASY)
                .choices(Arrays.asList(
                        "1 consumer",
                        "2 consumers",
                        "4 consumers",
                        "Unlimited consumers"
                ))
                .correctAnswer("4 consumers")
                .explanation("Within a consumer group, each partition is assigned to exactly one consumer. Therefore, if a topic has 4 partitions, adding a 5th consumer to the group will result in that consumer remaining idle.")
                .topic(kafkaPartitions)
                .build());
    }

    private void seedDailyTips() {
        dailyTipRepository.save(DailyTip.builder()
                .title("Optimize Database Joins with Indexes")
                .content("When performing joins in relational databases, always ensure foreign keys and fields in the JOIN clause are properly indexed. This prevents full-table scans, transforming O(N) operations into high-speed O(log N) lookups.")
                .build());

        dailyTipRepository.save(DailyTip.builder()
                .title("Prefer Composition Over Inheritance")
                .content("Design your classes by composing objects rather than creating deep inheritance hierarchies. Inheritance tightly couples subclasses to parent implementations, while composition offers pluggable, easily testable behaviors.")
                .build());

        dailyTipRepository.save(DailyTip.builder()
                .title("Idempotent API Endpoints")
                .content("Always design modification endpoints (POST/PUT/DELETE) to be idempotent where possible. For POST requests, utilize unique request/transaction IDs to prevent duplicate actions if network timeouts trigger auto-retries.")
                .build());

        dailyTipRepository.save(DailyTip.builder()
                .title("Use useMemo Wisely in React")
                .content("Do not wrap every function or object in useMemo or useCallback in React. There is overhead in comparing dependency arrays. Reserve optimization for heavy calculations (e.g. searching/sorting massive lists) or preventing redundant child re-renders.")
                .build());

        dailyTipRepository.save(DailyTip.builder()
                .title("Avoid SELECT * in Production Queries")
                .content("Always enumerate specific columns in your SELECT SQL queries. SELECT * fetches columns you do not need, increases database memory usage, leads to bloated network transfer payloads, and can break mapping logic when schemas update.")
                .build());
    }
}
