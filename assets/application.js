---
---

{% include assets/js/jquery-2.1.4.min.js %}

{% if jekyll.environment == 'development' %}
	{% include assets/js/segments/segment.js %}
{% else %}
	{% include assets/js/segment.min.js %}
{% endif %}	
