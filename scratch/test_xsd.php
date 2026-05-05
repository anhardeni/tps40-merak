<?php
$xml = new SimpleXMLElement('<?xml version="1.0" encoding="utf-8"?><DOCUMENT xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="cocotangki.xsd"></DOCUMENT>');
echo $xml->asXML();
