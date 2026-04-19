#include "crow.h"
#include "server.cpp"
#include <cstdlib>
#include <iostream>

int main() {
    crow::SimpleApp app;

    setupRoutes(app);

    int port = 8080;
    if (const char* envPort = std::getenv("PORT")) {
        port = std::atoi(envPort);
    }

    std::cout << "C++ Metering Engine running on port " << port << std::endl;
    app.port(port).multithreaded().run();

    return 0;
}
