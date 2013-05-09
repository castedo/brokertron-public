package com.brokertron;

import java.io.*;
import java.util.*;

import javax.servlet.http.*;
import javax.servlet.*;

import com.ib.client.*;

public class IBServlet extends HttpServlet implements EWrapper {

    private EClientConnector m_connector = new EClientConnector(this);
    private List<String> m_msgs = new ArrayList<String>();

    public void doGet(HttpServletRequest req, HttpServletResponse res)
        throws ServletException, IOException
    {
        if (req.getServletPath().equals("/index.html")) {
            req.setAttribute("messages", m_msgs);
            req.setAttribute("connecting", m_connector.isConnecting());
            EClientSocket client = m_connector.client();
            req.setAttribute("connected", client.isConnected());
            if (client.isConnected()) {
              req.setAttribute("server_version", client.serverVersion());
              req.setAttribute("connection_time", client.TwsConnectionTime());
            }
            req.getRequestDispatcher("/WEB-INF/index.jsp").forward(req, res);
        } else {
            res.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    public void doPost(HttpServletRequest req, HttpServletResponse res)
        throws ServletException, IOException
    {
        if (req.getServletPath().equals("/connect.do")) {
            String host = req.getParameter("host");
            int port = Integer.parseInt(req.getParameter("port"));
            int client_id = Integer.parseInt(req.getParameter("client_id"));
            m_connector.asyncConnect(host, port, client_id);
            res.sendRedirect("");
        } else if (req.getServletPath().equals("/disconnect.do")) {
            m_connector.disconnect();
            res.sendRedirect("");
        } else if (req.getServletPath().equals("/clear.do")) {
            m_msgs.clear();
            res.sendRedirect("");
        } else if (req.getServletPath().equals("/account_updates.do")) {
            EClientSocket client = m_connector.client();
            if (client.isConnected()) {
              client.reqAccountUpdates(true, req.getParameter("account"));
            }
            res.sendRedirect("");
        } else {
            res.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    protected void addMsg(String msg) {
        synchronized(m_msgs) { m_msgs.add(msg); }
    }

    public void error(Exception ex) {
        addMsg(EWrapperMsgGenerator.error(ex));
    }

    public void error(String str) {
        addMsg(EWrapperMsgGenerator.error(str));
    }

    public void error(int id, int errorCode, String errorMsg) {
        addMsg(EWrapperMsgGenerator.error(id, errorCode, errorMsg));
    }

    public void connectionClosed() {
        addMsg(EWrapperMsgGenerator.connectionClosed());
    }

    public void nextValidId(int id) {
		addMsg(EWrapperMsgGenerator.nextValidId(id));
    }

    public void currentTime(long secs) {
		addMsg(EWrapperMsgGenerator.currentTime(secs));
    }

    public void updateAccountTime(String time) {
		addMsg(EWrapperMsgGenerator.updateAccountTime(time));
    }

    public void updateAccountValue(String k, String v, String c, String a) {
        addMsg(EWrapperMsgGenerator.updateAccountValue(k, v, c, a));
    }

    public void accountDownloadEnd(String account) {
    	addMsg(EWrapperMsgGenerator.accountDownloadEnd(account));
        m_connector.client().reqAccountUpdates(false, account);
    }

    public void managedAccounts(String accountsList) {
        addMsg(EWrapperMsgGenerator.managedAccounts(accountsList));
    }

    //////////////////////////////////////////////////////////////
    // Ignored

    public void openOrder(int orderId, Contract contract, Order order, OrderState orderState) {}

    public void openOrderEnd() {}

    public void orderStatus(int orderId, String status, int filled, int remaining,
        double avgFillPrice, int permId, int parentId, double lastFillPrice,
        int clientId, String whyHeld) {}

    public void historicalData(int reqId, String date, double open,
        double high, double low, double close, int volume, int count,
        double WAP, boolean hasGaps) {}

    public void tickPrice(int tickerId, int field, double price,
        int canAutoExecute) {}
    public void tickSize(int tickerId, int field, int size) {}
    public void tickOptionComputation(int tickerId, int field,
        double impliedVol, double delta, double optPrice, double pvDividend,
        double gamma, double vega, double theta, double undPrice) {}
    public void tickGeneric(int tickerId, int tickType, double value) {}
    public void tickString(int tickerId, int tickType, String value) {}
    public void tickEFP(int tickerId, int tickType, double basisPoints,
        String formattedBasisPoints, double impliedFuture, int holdDays,
        String futureExpiry, double dividendImpact, double dividendsToExpiry)
    {}

    public void updatePortfolio(Contract contract, int position, double marketPrice, double marketValue,
            double averageCost, double unrealizedPNL, double realizedPNL, String accountName) {}

    public void contractDetails(int reqId, ContractDetails contractDetails) {}
    public void bondContractDetails(int reqId, ContractDetails contractDetails) {}
    public void contractDetailsEnd(int reqId) {}
    public void execDetails( int reqId, Contract contract, Execution execution) {}
    public void execDetailsEnd( int reqId) {}
    public void updateMktDepth( int tickerId, int position, int operation, int side, double price, int size) {}
    public void updateMktDepthL2( int tickerId, int position, String marketMaker, int operation,
        int side, double price, int size) {}
    public void updateNewsBulletin( int msgId, int msgType, String message, String origExchange) {}

    public void receiveFA(int faDataType, String xml) {}
    public void scannerParameters(String xml) {}
    public void scannerData(int reqId, int rank, ContractDetails contractDetails, String distance,
        String benchmark, String projection, String legsStr) {}
    public void scannerDataEnd(int reqId) {}
    public void realtimeBar(int reqId, long time, double open, double high, double low, double close, long volume, double wap, int count) {}
    public void fundamentalData(int reqId, String data) {}
    public void deltaNeutralValidation(int reqId, UnderComp underComp) {}
    public void tickSnapshotEnd(int reqId) {}
    public void marketDataType(int reqId, int marketDataType) {}
    public void commissionReport(CommissionReport commissionReport) {}
}

