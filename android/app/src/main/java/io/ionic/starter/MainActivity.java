package io.ionic.starter;

import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        Intent intent = getIntent();
        Uri uri = intent.getData();
        if (uri != null && "io.supabase.oauth".equals(uri.getScheme()) && "login".equals(uri.getHost())) {
            String code = uri.getQueryParameter("code");
            if (code != null) {
                // Manejar el código aquí, como por ejemplo iniciar sesión en Supabase con el código
            }
        }
    }
}