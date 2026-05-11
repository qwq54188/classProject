package com.streetsound;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.streetsound.mapper")
public class StreetSoundApplication {
    public static void main(String[] args) {
        SpringApplication.run(StreetSoundApplication.class, args);
    }
}
