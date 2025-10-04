export enum RedisDb {
    Sessions = 0,
    Cache = 1,
    PubSub = 2,
    MembersJob = 3,
    ServerToServerSessions = 4,
    Lock = 5,
    Queue = 6,
    Stream = 7,
    ApiRateLimit = 8,
    IpWarmupJobs = 9,
    SchedulerRedisQueue = 10
}