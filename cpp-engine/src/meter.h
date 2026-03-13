#pragma once
// Ye batata hai — is file ko sirf ek baar include karo
// Duplicate inclusion se bachata hai

#include <string>
// string use karne ke liye (tenantId, timestamp)

#include <unordered_map>
// HashMap — fast data storage
// Key = tenantId, Value = UsageRecord

// ─────────────────────────────────────
// STRUCT = Simple data container
// Class jaisa hai but sab public hota hai
// ─────────────────────────────────────
struct UsageRecord {
    std::string tenantId;    // "t001" — kaun hai customer
    double storageGB;        // 50.0 — kitna storage use kiya
    long long apiCalls;      // 150000 — kitni API calls ki
    double bandwidthGB;      // 20.0 — kitna data transfer hua
    std::string timestamp;   // "2026-03-14" — kab hua
};

// ─────────────────────────────────────
// CLASS = Engine jo kaam karta hai
// ─────────────────────────────────────
class MeteringEngine {
public:
    // Teen kaam karta hai ye engine:
    void recordUsage(const UsageRecord& record);  // usage add karo
    UsageRecord getUsage(const std::string& tenantId); // usage dekho
    void resetUsage(const std::string& tenantId); // usage reset karo

private:
    // HashMap mein sab tenants ka data store hota hai
    // "t001" -> {storageGB: 50, apiCalls: 150000, ...}
    // "t002" -> {storageGB: 30, apiCalls: 80000, ...}
    std::unordered_map<std::string, UsageRecord> usageMap;
};
// ```

// ### 💡 Simple Analogy:
// ```
// UsageRecord = Ek customer ka bill slip
// MeteringEngine = Accountant jo sab slips manage karta hai
// usageMap = Accountant ki drawer (har customer ki alag file)