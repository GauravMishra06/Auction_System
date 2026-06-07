package com.example.Auction_System;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;

@SpringBootTest
@ContextConfiguration(initializers = DotenvContextInitializer.class)
class AuctionSystemApplicationTests {

	@Test
	void contextLoads() {
	}

}
