cmake_minimum_required(VERSION 3.15)
project(BillingEngine)
set(CMAKE_CXX_STANDARD 17)
include(FetchContent)
FetchContent_Declare(
  crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  GIT_TAG v1.0+5
)
FetchContent_MakeAvailable(crow)
find_package(nlohmann_json REQUIRED)
add_executable(billing_engine
  src/main.cpp
  src/meter.cpp
  src/billing.cpp
)
target_link_libraries(billing_engine
  Crow::Crow
  nlohmann_json::nlohmann_json
)