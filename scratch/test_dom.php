<?php
$dom = new \DOMDocument('1.0', 'utf-8');
$root = $dom->createElement('DOCUMENT');
$root->setAttribute('xmlns', 'cocotangki.xsd');
$dom->appendChild($root);
echo $dom->saveXML();
