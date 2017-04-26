# frozen_string_literal: true

class FetchLinkCardService < BaseService
  URL_PATTERN = %r{https?://\S+}
  USER_AGENT = "#{HTTP::Request::USER_AGENT} (Mastodon/#{Mastodon::VERSION}; +http://#{Rails.configuration.x.local_domain}/)"

  def call(status)
    # Get first http/https URL that isn't local
    url = status.text.match(URL_PATTERN).to_a.reject { |uri| TagManager.instance.local_url?(uri) }.first

    return if url.nil?

    response = http_client.get(url)

    return if response.code != 200 || response.mime_type != 'text/html'

    page = Nokogiri::HTML(response.to_s)
    card = PreviewCard.where(status: status).first_or_initialize(status: status, url: url)

    card.title       = meta_property(page, 'og:title') || page.at_xpath('//title')&.content
    card.description = meta_property(page, 'og:description') || meta_property(page, 'description')
    card.image       = URI.parse(Addressable::URI.parse(meta_property(page, 'og:image')).normalize.to_s) if meta_property(page, 'og:image')

    return if card.title.blank?

    card.save_with_optional_image!
  end

  private

  def http_client
    HTTP.headers(user_agent: USER_AGENT).timeout(:per_operation, write: 10, connect: 10, read: 10).follow
  end

  def meta_property(html, property)
    html.at_xpath("//meta[@property=\"#{property}\"]")&.attribute('content')&.value || html.at_xpath("//meta[@name=\"#{property}\"]")&.attribute('content')&.value
  end
end
