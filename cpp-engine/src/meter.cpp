#include "meter.h"
#include <stdexcept>  // exceptions ke liye (errors throw karne ke liye)

// ─────────────────────────────────────
// FUNCTION 1: recordUsage
// Naya usage aaya → purane mein add karo
// ─────────────────────────────────────
void MeteringEngine::recordUsage(const UsageRecord& record) {
    
    // usageMap["t001"] dhundho
    // Agar nahi mila → automatically nayi entry banao
    // Agar mila → existing entry lo
    auto& existing = usageMap[record.tenantId];
    
    // Purane values mein naye values ADD karo (replace nahi)
    // Kyunki usage accumulate hoti hai month bhar
    existing.tenantId    = record.tenantId;
    existing.storageGB   += record.storageGB;   // += matlab add karo
    existing.apiCalls    += record.apiCalls;
    existing.bandwidthGB += record.bandwidthGB;
    existing.timestamp   = record.timestamp;    // latest time save karo
}

// ─────────────────────────────────────
// FUNCTION 2: getUsage
// TenantId do → unka usage lo
// ─────────────────────────────────────
UsageRecord MeteringEngine::getUsage(const std::string& tenantId) {
    
    // find() se check karo — kya ye tenant exist karta hai?
    if (usageMap.find(tenantId) == usageMap.end())
        // .end() matlab "nahi mila" — error throw karo
        throw std::runtime_error("Tenant not found: " + tenantId);
    
    return usageMap[tenantId];  // usage return karo
}

// ─────────────────────────────────────
// FUNCTION 3: resetUsage
// Month end pe usage reset karo
// ─────────────────────────────────────
void MeteringEngine::resetUsage(const std::string& tenantId) {
    usageMap.erase(tenantId);  // HashMap se delete karo
}
// ```

// ### 💡 Simple Analogy:
// ```
// recordUsage = Meter reading add karna (bijli meter jaisa)
// getUsage    = Meter reading dekhna
// resetUsage  = New month start — meter zero karna