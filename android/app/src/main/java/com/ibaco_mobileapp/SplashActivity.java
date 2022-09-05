package com.ibaco_mobileapp;

import android.content.Intent;
import com.facebook.react.ReactActivity;
import android.os.Bundle;

public class SplashActivity extends ReactActivity {

   @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(this, MainActivity.class);

        // this line is necessary to open notification when app is closed
        intent.putExtras(this.getIntent());
        startActivity(intent);
        finish();
    }
}
