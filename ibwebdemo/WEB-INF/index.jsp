<%@page import="java.util.*" %>
<%
    boolean connected = (Boolean)request.getAttribute("connected");
    boolean connecting = (Boolean)request.getAttribute("connecting");
    List<String> msgs = (ArrayList<String>)request.getAttribute("messages");
    String host = request.getServerName();
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en">
<head>
<title>IB API Demo Web Application</title>
<link href="style.css" type="text/css" rel="stylesheet"/>
<% if (connecting) { %>
  <meta http-equiv="refresh" content="1">
<% } %>
</head>
<body>
<h1>IB API Demo Web Application</h1>
<a href=""><button>Refresh</button></a>
<p id='connection-status'>
    ${ connected ? "Connected" : (connecting ? "Connecting" : "Disconnected") }
</p>
<% if (connected) { %>
    <dl>
        <dt>Server Version</dt>
        <dd>${server_version}</dd>
        <dt>Connection Time</dt>
        <dd>${connection_time}</dd>
    </dl>
<% } %>

<% if (!connected && !connecting) { %>
<p>Make sure to log in to IB before connecting this demo web application to the IB API.</p>
<% } %>
<p>
Log in and out of IB securely from <a href="https://<%=host%>:18080/ui/" target="gib">https://<%=host%>:18080/ui/</a> using
<a href="http://www.brokertron.com/gateway/" target="_blank">Brokertron Gateway for IB</a> installed on this server.
</p>

<% if (connected || connecting) { %>

    <form action="disconnect.do" method="post">
    <fieldset>
        <input type="submit" value="Disconnect"/>
    </fieldset>
    </form>

    <form action="account_updates.do" method="post">
    <fieldset>
        <label>account</label>
        <input type="text" name="account"/>
        <input type="submit" value="Get Account Update"/>
    </fieldset>
    </form>

<% } else { %>

    <form action="connect.do" method="post">
    <fieldset>
        <label>host</label>
        <input type="text" name="host"/>
        <label>port</label>
        <input type="text" name="port" value="4001" size="6"/>
        <label>API client id</label>
        <input type="text" name="client_id" value="1" size="3"/>
        <input type="submit" value="Connect"/>
    </fieldset>
    </form>

<% } %>

<hr/>

<div id="messages">
    <form action="clear.do" method="post">
        <input type="submit" value="Clear Messages"/>
    </form>
    <ul>
    <% for (String msg : msgs) { %>
        <li><%= msg%></li>
    <% } %>
    </ul>
</div>

</body>
</html>
