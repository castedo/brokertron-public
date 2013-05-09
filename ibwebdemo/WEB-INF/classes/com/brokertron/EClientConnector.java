package com.brokertron;

import com.ib.client.*;

public class EClientConnector {

    private class ConnectingThread extends Thread {
        String host;
        int port;
        int clientId;
        public void run() {
            m_client.eConnect(host, port, clientId);
        }
    };

    private EClientSocket m_client;
    private ConnectingThread m_thread;
    private Object m_lock = new Object();

    public EClientConnector(EWrapper wrapper) {
        m_client = new EClientSocket(wrapper);
    }

    public EClientSocket client() {
        return m_client;
    }

    public boolean isConnecting() {
        Thread local = m_thread;
        return local != null && local.isAlive();
    }

    private void abortIfConnecting() {
        if (isConnecting()) {
          m_thread.interrupt();
          m_thread = null;
          m_client = new EClientSocket(m_client.wrapper());
        }
    }

    public void asyncConnect(String host, int port, int clientId) {
        synchronized(m_lock) {
            abortIfConnecting();
            m_thread = new ConnectingThread();
            m_thread.host = host;
            m_thread.port = port;
            m_thread.clientId = clientId;
            m_thread.start();
        }
    }

    public void disconnect() {
        synchronized(m_lock) {
            abortIfConnecting();
            m_client.eDisconnect();
        }
    }
}

