-- Create profiles table for user information
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create tricks table (basic info visible to all)
CREATE TABLE public.tricks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  winning_rate numeric(5,2) CHECK (winning_rate >= 0 AND winning_rate <= 100),
  category text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tricks ENABLE ROW LEVEL SECURITY;

-- Anyone can view tricks
CREATE POLICY "Anyone can view tricks"
  ON public.tricks FOR SELECT
  USING (true);

-- Users can create their own tricks
CREATE POLICY "Users can create tricks"
  ON public.tricks FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Users can update their own tricks
CREATE POLICY "Users can update own tricks"
  ON public.tricks FOR UPDATE
  USING (auth.uid() = seller_id);

-- Users can delete their own tricks
CREATE POLICY "Users can delete own tricks"
  ON public.tricks FOR DELETE
  USING (auth.uid() = seller_id);

-- Create trick_content table (only visible to buyers)
CREATE TABLE public.trick_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trick_id uuid REFERENCES public.tricks(id) ON DELETE CASCADE UNIQUE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.trick_content ENABLE ROW LEVEL SECURITY;

-- Create trick_purchases table BEFORE the function that uses it
CREATE TABLE public.trick_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trick_id uuid REFERENCES public.tricks(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  purchased_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(trick_id, buyer_id)
);

ALTER TABLE public.trick_purchases ENABLE ROW LEVEL SECURITY;

-- NOW create the function that checks if user purchased a trick
CREATE OR REPLACE FUNCTION public.user_purchased_trick(user_id uuid, check_trick_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trick_purchases
    WHERE buyer_id = user_id AND trick_id = check_trick_id
  );
$$;

-- Sellers can view their own trick content
CREATE POLICY "Sellers can view own trick content"
  ON public.trick_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tricks
      WHERE tricks.id = trick_content.trick_id
      AND tricks.seller_id = auth.uid()
    )
  );

-- Buyers can view purchased trick content
CREATE POLICY "Buyers can view purchased tricks"
  ON public.trick_content FOR SELECT
  USING (public.user_purchased_trick(auth.uid(), trick_id));

-- Sellers can insert their own trick content
CREATE POLICY "Sellers can insert trick content"
  ON public.trick_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tricks
      WHERE tricks.id = trick_content.trick_id
      AND tricks.seller_id = auth.uid()
    )
  );

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.trick_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

-- Users can create purchases
CREATE POLICY "Users can purchase tricks"
  ON public.trick_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();