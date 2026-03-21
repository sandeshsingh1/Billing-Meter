FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    cmake g++ make \
    libboost-all-dev \
    nlohmann-json3-dev \
    libssl-dev \
    libasio-dev \
    git curl \
    && rm -rf /var/lib/apt/lists/*

# Crow header copy karo sahi jagah
RUN git clone https://github.com/CrowCpp/Crow.git /crow && \
    cp /crow/include/crow.h /usr/local/include/ && \
    cp -r /crow/include/crow /usr/local/include/

WORKDIR /app

COPY . .

RUN rm -rf build && mkdir build && cd build && cmake .. && make -j4

EXPOSE 8080

CMD ["./build/billing_engine"]