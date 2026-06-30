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
    private final RoadmapRepository roadmapRepository;
    private final RoadmapStepRepository roadmapStepRepository;


    @Override
    public void run(String... args) throws Exception {
        log.info("Starting Learning Space database seeding...");

        if (topicRepository.count() == 0) {
            log.info("No topics found. Performing initial full database seed...");
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

            Topic ml = createTopic("Machine Learning", "Mathematical foundations, regression, neural networks, and model training.", "ml");
            Topic mlSub = createSubtopic("Supervised Learning", "Linear models, support vector machines, decision trees, and validation.", ml);

            Topic sql = createTopic("SQL & Databases", "Relational calculus, index selection, query execution plans, and normalization.", "sql");
            Topic sqlSub = createSubtopic("Query Optimization", "B-Trees, Hash joins, transaction isolations, and indexes.", sql);

            log.info("Topics and Subtopics seeded successfully.");

            // 2. Seed Reference Resources (Documentation & Videos)
            seedResources(jvm, redisCache, reactHooks, goRoutines, kafkaPartitions, mlSub, sqlSub);

            // 3. Seed Practice Questions
            seedQuestions(jvm, redisCache, reactHooks, goRoutines, kafkaPartitions, mlSub, sqlSub);

            // 4. Seed Daily Tips
            seedDailyTips();

            // 5. Seed Career Roadmaps
            seedRoadmaps(java, python, spring, js, react, angular, cpp, flutter, go, kafka, redis, ml, sql);
        } else {
            log.info("Topics already present. Making sure new topics (ML, SQL) and roadmaps exist...");
            ensureNewTopicsExist();
            if (roadmapRepository.count() == 0) {
                seedRoadmapsFromDatabase();
            }
        }

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

    private void seedResources(Topic jvm, Topic redisCache, Topic reactHooks, Topic goRoutines, Topic kafkaPartitions, Topic mlSub, Topic sqlSub) {
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

        // ML resources
        resourceRepository.save(Resource.builder()
                .title("Scikit-Learn Classification Guide")
                .url("https://scikit-learn.org/stable/supervised_learning.html")
                .type(ResourceType.DOCUMENTATION)
                .description("Supervised learning algorithms reference from Scikit-Learn documentation.")
                .topic(mlSub)
                .build());

        // SQL resources
        resourceRepository.save(Resource.builder()
                .title("PostgreSQL Index Types Guide")
                .url("https://www.postgresql.org/docs/current/indexes-types.html")
                .type(ResourceType.DOCUMENTATION)
                .description("Official documentation outlining B-Tree, Hash, GIN, and GiST indexing mechanisms.")
                .topic(sqlSub)
                .build());
    }


    private void seedQuestions(Topic jvm, Topic redisCache, Topic reactHooks, Topic goRoutines, Topic kafkaPartitions, Topic mlSub, Topic sqlSub) {
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

        // ML Question
        questionRepository.save(PracticeQuestion.builder()
                .title("Supervised Classification Models")
                .content("Which supervised algorithm computes class probability using the logistic sigmoid function?")
                .difficulty(DifficultyLevel.EASY)
                .choices(Arrays.asList(
                        "Linear Regression",
                        "Logistic Regression",
                        "K-Means Clustering",
                        "Principal Component Analysis"
                ))
                .correctAnswer("Logistic Regression")
                .explanation("Logistic Regression uses the logistic sigmoid function to map predicted values to probabilities between 0 and 1 for binary classification.")
                .topic(mlSub)
                .build());

        // SQL Question
        questionRepository.save(PracticeQuestion.builder()
                .title("Database Indexes")
                .content("What is the default index type used in PostgreSQL and most relational databases for range scans?")
                .difficulty(DifficultyLevel.EASY)
                .choices(Arrays.asList(
                        "Hash Index",
                        "GIN Index",
                        "B-Tree Index",
                        "BRIN Index"
                ))
                .correctAnswer("B-Tree Index")
                .explanation("B-Trees are self-balancing search trees that keep data sorted and allow search, sequential access, insertion, and deletion in logarithmic time, making them ideal for range queries.")
                .topic(sqlSub)
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

    private void seedRoadmaps(Topic java, Topic python, Topic spring, Topic js, Topic react, Topic angular, Topic cpp, Topic flutter, Topic go, Topic kafka, Topic redis, Topic ml, Topic sql) {
        log.info("Seeding Career Roadmaps...");
        
        // 1. Java Full Stack Developer
        Roadmap javaFs = createRoadmap("Java Full Stack Developer", "Master core Java, backend services with Spring Boot, and interactive frontends with JavaScript and React.", "briefcase");
        createRoadmapStep(javaFs, 1, "Milestone 1: Java Foundations", "Learn core programming constructs, object-orientation, and JVM runtime mechanics.", List.of(java));
        createRoadmapStep(javaFs, 2, "Milestone 2: Enterprise Backend", "Build high-throughput HTTP endpoints, dependency injection configs, and security rules with Spring.", List.of(spring));
        createRoadmapStep(javaFs, 3, "Milestone 3: Web Frontends", "Develop dynamic client interfaces using JavaScript and React.", List.of(js, react));

        // 2. Python Full Stack Developer
        Roadmap pythonFs = createRoadmap("Python Full Stack Developer", "Develop rapid APIs using Python frameworks and bundle them with modern React user interfaces.", "python");
        createRoadmapStep(pythonFs, 1, "Milestone 1: Python Core", "Deep dive into language decorators, asynchronous loops, and scripting controls.", List.of(python));
        createRoadmapStep(pythonFs, 2, "Milestone 2: Client Web Layer", "Master frontend design, DOM updates, React components, and lifecycle hooks.", List.of(js, react));

        // 3. Java Backend Developer
        Roadmap javaBe = createRoadmap("Java Backend Developer", "Design high-performance backend systems with Java, Redis caches, and event streams via Kafka.", "database");
        createRoadmapStep(javaBe, 1, "Milestone 1: Language Mechanics", "Learn concurrent execution and memory garbage collection structures.", List.of(java));
        createRoadmapStep(javaBe, 2, "Milestone 2: Framework Mastery", "Adopt bean contexts, JPA database layers, and JWT authentication setups.", List.of(spring));
        createRoadmapStep(javaBe, 3, "Milestone 3: Distributed Systems", "Introduce distributed in-memory cache and publish/subscribe stream partitions.", List.of(redis, kafka));

        // 4. Frontend Developer
        Roadmap frontendDev = createRoadmap("Frontend Developer", "Learn how to build stunning, component-based user interfaces with React and Angular.", "react");
        createRoadmapStep(frontendDev, 1, "Milestone 1: JavaScript Engine", "Master asynchronous event loop mechanics, closures, and lexical scopes.", List.of(js));
        createRoadmapStep(frontendDev, 2, "Milestone 2: Modern Frameworks", "Learn hooks, rendering phases, modules, and change detection bindings.", List.of(react, angular));

        // 5. Node.js Developer
        Roadmap nodeDev = createRoadmap("Node.js Developer", "Build event-driven asynchronous services using JavaScript, Redis datastores, and Kafka streams.", "go");
        createRoadmapStep(nodeDev, 1, "Milestone 1: Async Runtime", "Deep dive into event loop queues, closures, and modern ECMAScript standards.", List.of(js));
        createRoadmapStep(nodeDev, 2, "Milestone 2: Data & Messaging", "Implement sub-millisecond sorted set caches and partition broker replication.", List.of(redis, kafka));

        // 6. AI Engineer
        Roadmap aiEng = createRoadmap("AI Engineer", "Harness Python foundations and supervised/unsupervised machine learning models to design modern intelligent applications.", "cpu");
        createRoadmapStep(aiEng, 1, "Milestone 1: Python Scoping", "Learn generators, dynamic types, and async execution paradigms.", List.of(python));
        createRoadmapStep(aiEng, 2, "Milestone 2: ML Fundamentals", "Train linear classifiers, decision trees, and evaluate model performance.", List.of(ml));

        // 7. Data Analyst
        Roadmap dataAnalyst = createRoadmap("Data Analyst", "Leverage SQL databases, custom indexing, and Python scripting to build fast data processing pipelines.", "chart");
        createRoadmapStep(dataAnalyst, 1, "Milestone 1: Database queries", "Optimize database joins, choose correct B-tree index strategies, and write clean SQL.", List.of(sql));
        createRoadmapStep(dataAnalyst, 2, "Milestone 2: Python Scripting", "Utilize dynamic script wrappers, decorators, and data arrays.", List.of(python));
    }

    private Roadmap createRoadmap(String title, String description, String icon) {
        Roadmap rm = Roadmap.builder()
                .title(title)
                .description(description)
                .icon(icon)
                .build();
        return roadmapRepository.save(rm);
    }

    private RoadmapStep createRoadmapStep(Roadmap rm, int order, String title, String description, List<Topic> topics) {
        RoadmapStep step = RoadmapStep.builder()
                .roadmap(rm)
                .stepOrder(order)
                .title(title)
                .description(description)
                .topics(new java.util.ArrayList<>(topics))
                .build();
        return roadmapStepRepository.save(step);
    }

    private void ensureNewTopicsExist() {
        if (topicRepository.findByNameIgnoreCase("Machine Learning").isEmpty()) {
            Topic ml = createTopic("Machine Learning", "Mathematical foundations, regression, neural networks, and model training.", "ml");
            Topic mlSub = createSubtopic("Supervised Learning", "Linear models, support vector machines, decision trees, and validation.", ml);
            
            resourceRepository.save(Resource.builder()
                    .title("Scikit-Learn Classification Guide")
                    .url("https://scikit-learn.org/stable/supervised_learning.html")
                    .type(ResourceType.DOCUMENTATION)
                    .description("Supervised learning algorithms reference from Scikit-Learn documentation.")
                    .topic(mlSub)
                    .build());

            questionRepository.save(PracticeQuestion.builder()
                    .title("Supervised Classification Models")
                    .content("Which supervised algorithm computes class probability using the logistic sigmoid function?")
                    .difficulty(DifficultyLevel.EASY)
                    .choices(Arrays.asList(
                            "Linear Regression",
                            "Logistic Regression",
                            "K-Means Clustering",
                            "Principal Component Analysis"
                    ))
                    .correctAnswer("Logistic Regression")
                    .explanation("Logistic Regression uses the logistic sigmoid function to map predicted values to probabilities between 0 and 1 for binary classification.")
                    .topic(mlSub)
                    .build());
        }

        if (topicRepository.findByNameIgnoreCase("SQL & Databases").isEmpty()) {
            Topic sql = createTopic("SQL & Databases", "Relational calculus, index selection, query execution plans, and normalization.", "sql");
            Topic sqlSub = createSubtopic("Query Optimization", "B-Trees, Hash joins, transaction isolations, and indexes.", sql);

            resourceRepository.save(Resource.builder()
                    .title("PostgreSQL Index Types Guide")
                    .url("https://www.postgresql.org/docs/current/indexes-types.html")
                    .type(ResourceType.DOCUMENTATION)
                    .description("Official documentation outlining B-Tree, Hash, GIN, and GiST indexing mechanisms.")
                    .topic(sqlSub)
                    .build());

            questionRepository.save(PracticeQuestion.builder()
                    .title("Database Indexes")
                    .content("What is the default index type used in PostgreSQL and most relational databases for range scans?")
                    .difficulty(DifficultyLevel.EASY)
                    .choices(Arrays.asList(
                            "Hash Index",
                            "GIN Index",
                            "B-Tree Index",
                            "BRIN Index"
                    ))
                    .correctAnswer("B-Tree Index")
                    .explanation("B-Trees are self-balancing search trees that keep data sorted and allow search, sequential access, insertion, and deletion in logarithmic time, making them ideal for range queries.")
                    .topic(sqlSub)
                    .build());
        }
    }

    private void seedRoadmapsFromDatabase() {
        Topic java = topicRepository.findByNameIgnoreCase("Java").orElse(null);
        Topic python = topicRepository.findByNameIgnoreCase("Python").orElse(null);
        Topic spring = topicRepository.findByNameIgnoreCase("Spring").orElse(null);
        Topic js = topicRepository.findByNameIgnoreCase("JavaScript").orElse(null);
        Topic react = topicRepository.findByNameIgnoreCase("React").orElse(null);
        Topic angular = topicRepository.findByNameIgnoreCase("Angular").orElse(null);
        Topic cpp = topicRepository.findByNameIgnoreCase("C++").orElse(null);
        Topic flutter = topicRepository.findByNameIgnoreCase("Flutter").orElse(null);
        Topic go = topicRepository.findByNameIgnoreCase("Go").orElse(null);
        Topic kafka = topicRepository.findByNameIgnoreCase("Kafka").orElse(null);
        Topic redis = topicRepository.findByNameIgnoreCase("Redis").orElse(null);
        Topic ml = topicRepository.findByNameIgnoreCase("Machine Learning").orElse(null);
        Topic sql = topicRepository.findByNameIgnoreCase("SQL & Databases").orElse(null);

        seedRoadmaps(java, python, spring, js, react, angular, cpp, flutter, go, kafka, redis, ml, sql);
    }
}
