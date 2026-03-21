cmake_minimum_required(VERSION 3.15)
project(BillingEngine)

set(CMAKE_CXX_STANDARD 17)

find_package(nlohmann_json REQUIRED)
find_package(Threads REQUIRED)

include_directories(/usr/local/include)

add_executable(billing_engine
  src/main.cpp
  src/meter.cpp
  src/billing.cpp
)

target_link_libraries(billing_engine
  nlohmann_json::nlohmann_json
  Threads::Threads
)