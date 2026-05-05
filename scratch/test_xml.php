<?php
$xml = new SimpleXMLElement('<?xml version="1.0" encoding="utf-8"?><DOCUMENT xmlns="cocotangki.xsd"></DOCUMENT>');
$cocotangki = $xml->addChild('COCOTANGKI');
$header = $cocotangki->addChild('HEADER');
$header->addChild('KD_DOK', '1');

echo $xml->asXML();
