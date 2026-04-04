FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    cmake g++ make \
    libboost-all-dev \
    nlohmann-json3-dev \
    libssl-dev \
    libasio-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ✅ Git clone ki jagah curl se seedha download karo
RUN curl -L https://github.com/CrowCpp/Crow/releases/download/v1.0+5/crow-v1.0+5.deb -o crow.deb \
    && dpkg -i crow.deb \
    && rm crow.deb

WORKDIR /app
COPY . .
RUN rm -rf build && mkdir build && cd build && cmake .. && make -j4

EXPOSE 8080
CMD ["./build/billing_engine"]