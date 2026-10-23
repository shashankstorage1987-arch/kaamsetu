package com.kaamsetu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KaamSetuApplication {

    public static void main(String[] args) {
        SpringApplication.run(KaamSetuApplication.class, args);
    }
}
