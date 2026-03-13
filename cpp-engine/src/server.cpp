#include "crow.h"
#include "meter.h"
#include "billing.h"
#include <nlohmann/json.hpp>

#include <ctime>

using json = nlohmann::json;

// Global instances
MeteringEngine  meter;
BillingCalculator calculator;

// Helper: get current timestamp
std::string getCurrentTimestamp() {
    time_t now = time(0);
    char buf[80];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", localtime(&now));
    return std::string(buf);
}

void setupRoutes(crow::SimpleApp& app) {

    // Health check
    CROW_ROUTE(app, "/health")
    ([]() {
        json res = {{"status", "OK"}, {"engine", "C++ Metering Engine v1.0"}};
        return crow::response(res.dump());
    });

    // POST /usage — record usage for a tenant
    CROW_ROUTE(app, "/usage").methods("POST"_method)
    ([](const crow::request& req) {
        try {
            auto body = json::parse(req.body);

            UsageRecord record;
            record.tenantId    = body["tenantId"].get<std::string>();
            record.storageGB   = body.value("storageGB", 0.0);
            record.apiCalls    = body.value("apiCalls", 0LL);
            record.bandwidthGB = body.value("bandwidthGB", 0.0);
            record.timestamp   = getCurrentTimestamp();

            meter.recordUsage(record);

            json res = {
                {"success", true},
                {"message", "Usage recorded"},
                {"tenantId", record.tenantId}
            };
            return crow::response(200, res.dump());

        } catch (const std::exception& e) {
            json err = {{"error", e.what()}};
            return crow::response(400, err.dump());
        }
    });

    // GET /usage/:tenantId — get usage for a tenant
    CROW_ROUTE(app, "/usage/<string>")
    ([](const std::string& tenantId) {
        try {
            auto usage = meter.getUsage(tenantId);
            json res = {
                {"tenantId",    usage.tenantId},
                {"storageGB",   usage.storageGB},
                {"apiCalls",    usage.apiCalls},
                {"bandwidthGB", usage.bandwidthGB},
                {"timestamp",   usage.timestamp}
            };
            return crow::response(200, res.dump());

        } catch (const std::exception& e) {
            json err = {{"error", e.what()}};
            return crow::response(404, err.dump());
        }
    });

    // GET /bill/:tenantId — calculate bill for a tenant
    CROW_ROUTE(app, "/bill/<string>")
    ([](const std::string& tenantId) {
        try {
            auto usage = meter.getUsage(tenantId);
            auto bill  = calculator.calculateBill(usage);

            json res = {
                {"tenantId",      bill.tenantId},
                {"storageCost",   bill.storageCost},
                {"apiCallsCost",  bill.apiCallsCost},
                {"bandwidthCost", bill.bandwidthCost},
                {"totalCost",     bill.totalCost},
                {"currency",      bill.currency}
            };
            return crow::response(200, res.dump());

        } catch (const std::exception& e) {
            json err = {{"error", e.what()}};
            return crow::response(404, err.dump());
        }
    });

    // DELETE /usage/:tenantId — reset usage
    CROW_ROUTE(app, "/usage/<string>").methods("DELETE"_method)
    ([](const std::string& tenantId) {
        meter.resetUsage(tenantId);
        json res = {{"success", true}, {"message", "Usage reset"}};
        return crow::response(200, res.dump());
    });
}









// // Ye 4 endpoints banata hai:

// // 1️⃣ POST /usage — usage record karo
// // Browser/app se data aata hai → engine mein save hota hai
// CROW_ROUTE(app, "/usage").methods("POST"_method)
// ([](const crow::request& req) {
//     auto body = json::parse(req.body);  // JSON string → object
    
//     UsageRecord record;
//     record.tenantId    = body["tenantId"];   // JSON se values nikalo
//     record.storageGB   = body["storageGB"];
//     record.apiCalls    = body["apiCalls"];
//     record.bandwidthGB = body["bandwidthGB"];
    
//     meter.recordUsage(record);  // engine mein save karo
    
//     return crow::response(200, "Usage recorded");  // success bolo
// });

// // 2️⃣ GET /usage/t001 — usage dekho
// CROW_ROUTE(app, "/usage/<string>")
// ([](const std::string& tenantId) {
//     auto usage = meter.getUsage(tenantId);  // engine se nikalo
//     // JSON banao aur return karo
//     json res = {
//         {"tenantId",  usage.tenantId},
//         {"storageGB", usage.storageGB},
//         // ...
//     };
//     return crow::response(200, res.dump());
// });

// // 3️⃣ GET /bill/t001 — bill calculate karo
// CROW_ROUTE(app, "/bill/<string>")
// ([](const std::string& tenantId) {
//     auto usage = meter.getUsage(tenantId);     // pehle usage lo
//     auto bill  = calculator.calculateBill(usage); // phir bill calculate karo
//     // JSON mein return karo
// });
// ```

// ### 💡 REST API Analogy:
// ```
// POST   /usage     = Data bhejo    (jaise form submit)
// GET    /usage/id  = Data maango   (jaise page load)
// DELETE /usage/id  = Data hatao    (jaise delete button)
// ```

// ---

// ## 🎯 Interview Mein Ye Bolna

// Agar Zoho pooche **"Explain your C++ engine"**:
// ```
// "Maine ek MeteringEngine class banaya jo 
// unordered_map use karke har tenant ki 
// usage track karta hai. 

// Jab bhi koi customer storage use karta hai, 
// recordUsage() function call hota hai jo 
// existing values mein add karta rehta hai.

// BillingCalculator class AWS jaisi pricing 
// use karke bill calculate karta hai — 
// storage per GB, API calls per 10k, 
// aur bandwidth per GB.

// Ye sab Crow HTTP library ke through 
// REST API ke roop mein expose kiya hai 
// jo JSON request/response handle karta hai."
// ```

// ---

// ## ✅ Tumhe Kya Aana Chahiye — Checklist
// ```
// C++ Basics:
// ✅ struct kya hota hai
// ✅ class kya hota hai
// ✅ unordered_map kaise kaam karta hai
// ✅ += operator (accumulation)
// ✅ throw/catch (error handling)

// Architecture:
// ✅ Metering Engine ka kaam
// ✅ Billing Calculator ka kaam
// ✅ REST API ke 4 endpoints
// ✅ Tenant concept (multi-tenant)

// Calculations:
// ✅ Storage = GB × $0.023
// ✅ API = (calls/10000) × $0.004
// ✅ Bandwidth = GB × $0.09
// ✅ Rounding trick