#include "crow.h"
#include "server.cpp"
#include <iostream>

int main() {
    crow::SimpleApp app;

    setupRoutes(app);

    std::cout << "🚀 C++ Metering Engine running on port 8080" << std::endl;
    app.port(8080).multithreaded().run();

    return 0;
}